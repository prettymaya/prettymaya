#!/usr/bin/env swift
// TTS Tool — uses AVSpeechSynthesizer to access ALL voices including Siri/Premium
// Usage:
//   swift tts_tool.swift list
//   swift tts_tool.swift speak "text" "voiceId" rate /tmp/tts_output.caf

import Foundation
import AVFoundation

func listVoices() {
    let voices = AVSpeechSynthesisVoice.speechVoices()
    let enVoices = voices.filter { $0.language.hasPrefix("en") }
    
    print("[\(enVoices.count) English voices]")
    for voice in enVoices.sorted(by: { $0.name < $1.name }) {
        let quality: String
        switch voice.quality {
        case .enhanced: quality = "Enhanced"
        case .premium: quality = "Premium"
        default: quality = "Default"
        }
        print("\(voice.identifier)|\(voice.name)|\(voice.language)|\(quality)")
    }
}

class TTSDelegate: NSObject, AVSpeechSynthesizerDelegate {
    var done = false
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        done = true
    }
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        done = true
    }
}

func speakToFile(text: String, voiceId: String, rate: Float, outputPath: String) {
    let synth = AVSpeechSynthesizer()
    let delegate = TTSDelegate()
    synth.delegate = delegate
    
    let utterance = AVSpeechUtterance(string: text)
    
    // Find voice
    if let voice = AVSpeechSynthesisVoice(identifier: voiceId) {
        utterance.voice = voice
    } else {
        let voices = AVSpeechSynthesisVoice.speechVoices()
        if let match = voices.first(where: { 
            $0.name.lowercased().contains(voiceId.lowercased()) && $0.language.hasPrefix("en") 
        }) {
            utterance.voice = match
        }
    }
    
    utterance.rate = rate
    
    let fileURL = URL(fileURLWithPath: outputPath)
    var audioFile: AVAudioFile?
    
    synth.write(utterance) { buffer in
        guard let pcmBuffer = buffer as? AVAudioPCMBuffer, pcmBuffer.frameLength > 0 else { return }
        
        if audioFile == nil {
            do {
                audioFile = try AVAudioFile(forWriting: fileURL, settings: pcmBuffer.format.settings)
            } catch {
                fputs("Error creating file: \(error)\n", stderr)
                return
            }
        }
        
        do {
            try audioFile?.write(from: pcmBuffer)
        } catch {
            fputs("Error writing: \(error)\n", stderr)
        }
    }
    
    // Wait for completion
    while !delegate.done {
        RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.1))
    }
    
    // Small delay to let buffers flush
    Thread.sleep(forTimeInterval: 0.5)
    print("OK:\(outputPath)")
}

let args = CommandLine.arguments
if args.count < 2 {
    print("Usage: swift tts_tool.swift list|speak")
    exit(0)
}

switch args[1] {
case "list":
    listVoices()
case "speak":
    guard args.count >= 6 else {
        fputs("Usage: speak text voiceId rate outputPath\n", stderr)
        exit(1)
    }
    speakToFile(text: args[2], voiceId: args[3], rate: Float(args[4]) ?? 0.5, outputPath: args[5])
default:
    fputs("Unknown: \(args[1])\n", stderr)
    exit(1)
}
