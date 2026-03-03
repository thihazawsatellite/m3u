const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // sources.json ဖတ်ရန် လမ်းကြောင်း
    const sourcesPath = path.join(process.cwd(), 'api', 'sources.json');
    
    if (!fs.existsSync(sourcesPath)) {
      return res.status(500).send("Error: sources.json not found");
    }

    const sources = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
    let m3uContent = "#EXTM3U\n";

    // လိုင်းများကို စုစည်းခြင်း
    for (const source of sources) {
      try {
        const response = await axios.get(source.url, { timeout: 8000 });
        const lines = response.data.split('\n');
        
        lines.forEach(line => {
          if (line.startsWith('#EXTINF') || (!line.startsWith('#') && line.trim() !== '')) {
            m3uContent += line + '\n';
          }
        });
      } catch (err) {
        console.error(`Error fetching ${source.name}:`, err.message);
      }
    }

    // M3U အဖြစ် ပြန်ထုတ်ပေးခြင်း
    res.setHeader('Content-Type', 'audio/x-mpegurl');
    res.setHeader('Content-Disposition', 'attachment; filename="index.m3u"');
    res.status(200).send(m3uContent);

  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
}; 
