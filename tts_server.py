#!/usr/bin/env python3
"""
Local TTS Server — bridges web app to macOS AVSpeechSynthesizer for Siri/Premium voices.
Run: python3 tts_server.py
Then the web app calls http://localhost:8765/speak?text=hello&voice=nicky&rate=0.5
"""

import http.server
import urllib.parse
import subprocess
import os
import json
import tempfile
import time
import threading

PORT = 8765
SWIFT_TOOL = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tts_tool')
SWIFT_SRC = SWIFT_TOOL + '.swift'

# Compile Swift tool if needed
def ensure_compiled():
    if not os.path.exists(SWIFT_TOOL) or os.path.getmtime(SWIFT_SRC) > os.path.getmtime(SWIFT_TOOL):
        print(f"[TTS] Compiling {SWIFT_SRC}...")
        result = subprocess.run(['swiftc', '-O', SWIFT_SRC, '-o', SWIFT_TOOL], capture_output=True, text=True)
        if result.returncode != 0:
            print(f"[TTS] Compile error: {result.stderr}")
            return False
        print("[TTS] Compiled successfully!")
    return True

# Get voice list
def get_voices():
    result = subprocess.run([SWIFT_TOOL, 'list'], capture_output=True, text=True, timeout=10)
    voices = []
    for line in result.stdout.strip().split('\n'):
        if '|' in line:
            parts = line.split('|')
            voices.append({
                'id': parts[0],
                'name': parts[1],
                'lang': parts[2],
                'quality': parts[3] if len(parts) > 3 else 'Default'
            })
    return voices

class TTSHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        if parsed.path == '/voices':
            self._cors_headers()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            voices = get_voices()
            self.wfile.write(json.dumps(voices).encode())
            return
            
        if parsed.path == '/speak':
            text = params.get('text', [''])[0]
            voice = params.get('voice', ['com.apple.ttsbundle.siri_nicky_en-US_compact'])[0]
            rate = params.get('rate', ['0.5'])[0]
            
            if not text:
                self.send_error(400, 'Missing text parameter')
                return
            
            # Generate audio
            tmp = tempfile.NamedTemporaryFile(suffix='.caf', delete=False)
            tmp.close()
            
            try:
                result = subprocess.run(
                    [SWIFT_TOOL, 'speak', text, voice, rate, tmp.name],
                    capture_output=True, text=True, timeout=30
                )
                
                if result.returncode != 0 or not os.path.exists(tmp.name):
                    self.send_error(500, f'TTS failed: {result.stderr}')
                    return
                
                # Serve the audio file
                self._cors_headers()
                self.send_response(200)
                self.send_header('Content-Type', 'audio/x-caf')
                self.send_header('Content-Disposition', 'inline; filename="speech.caf"')
                
                with open(tmp.name, 'rb') as f:
                    data = f.read()
                
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                
            finally:
                try: os.unlink(tmp.name)
                except: pass
            return
        
        self.send_error(404)
    
    def do_OPTIONS(self):
        self._cors_headers()
        self.send_response(200)
        self.end_headers()
    
    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
    
    def log_message(self, format, *args):
        print(f"[TTS] {args[0]}")

def main():
    if not ensure_compiled():
        print("[TTS] Cannot compile Swift tool. Exiting.")
        return
    
    voices = get_voices()
    en_voices = [v for v in voices if v['lang'].startswith('en')]
    siri_voices = [v for v in en_voices if 'siri' in v['id']]
    
    print(f"\n🎤 TTS Server")
    print(f"   Port: {PORT}")
    print(f"   Voices: {len(en_voices)} English, {len(siri_voices)} Siri")
    print(f"   Siri voices:")
    for v in siri_voices:
        print(f"     ⭐ {v['name']} ({v['lang']}) — {v['id']}")
    print(f"\n   URL: http://localhost:{PORT}")
    print(f"   Test: http://localhost:{PORT}/speak?text=hello&voice={siri_voices[0]['id'] if siri_voices else 'samantha'}")
    print(f"   Press Ctrl+C to stop\n")
    
    server = http.server.HTTPServer(('127.0.0.1', PORT), TTSHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[TTS] Server stopped.")

if __name__ == '__main__':
    main()
