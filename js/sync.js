// PrettyMaya - Cloud Sync Service (GitHub Gist)
// Uses GitHub Gists as a free, serverless JSON database for cross-device synchronization.

const SyncService = {
    API_URL: 'https://api.github.com/gists',
    FILENAME: 'prettymaya_sync_data.json',

    async testConnection(token) {
        if (!token) throw new Error('GitHub Token bulunamadı.');
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Token geçersiz veya GitHub API hatası.');
        }
        
        // Check scopes for 'gist'
        const scopes = response.headers.get('X-OAuth-Scopes') || '';
        if (!scopes.includes('gist')) {
            throw new Error('Bu Token "gist" yetkisine sahip değil. Lütfen Token oluştururken "gist" kutucuğunu işaretleyin.');
        }
        
        return true;
    },

    async createGist(token, dataString) {
        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Vocabulary Recall (PrettyMaya) Cloud Sync Database',
                public: false, // Secret Gist
                files: {
                    [this.FILENAME]: {
                        content: dataString
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Gist oluşturulamadı.');
        }

        const data = await response.json();
        return data.id; // Return the new Gist ID
    },

    async updateGist(token, gistId, dataString) {
        const response = await fetch(`${this.API_URL}/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [this.FILENAME]: {
                        content: dataString
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Gist güncellenemedi. ID yanlış veya silinmiş olabilir.');
        }

        return true;
    },

    async getGist(token, gistId) {
        const response = await fetch(`${this.API_URL}/${gistId}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Gist bulunamadı veya erişilemedi.');
        }

        const data = await response.json();
        const file = data.files[this.FILENAME];
        
        if (!file || !file.content) {
            throw new Error('Gist içinde geçerli bir uygulama verisi bulunamadı.');
        }

        return JSON.parse(file.content);
    }
};
