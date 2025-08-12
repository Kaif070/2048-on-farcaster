# Farcaster 2048 Mini App

A fully playable 2048 game that integrates with Farcaster for social score sharing. Built as a lightweight, mobile-first web app that can run as a Farcaster Mini App.

## Features

- ✅ Full 2048 game implementation with smooth animations
- ✅ Mobile-first responsive design with touch/swipe controls
- ✅ Keyboard support for desktop play
- ✅ Local high score persistence
- ✅ Farcaster integration for sharing scores
- ✅ Fallback sharing options (Web Share API, clipboard)
- ✅ Progressive Web App ready

## Project Structure

```
farcaster-2048/
├── index.html              # Main game HTML
├── styles.css              # Game styling
├── app.js                  # Game logic + Farcaster integration
├── farcaster-manifest.json # Farcaster Mini App manifest
└── README.md              # Documentation
```

## Quick Start

1. **Local Development**
   ```bash
   # Clone or download the files
   # Open index.html in a browser
   # Or use a local server:
   python3 -m http.server 8000
   # Visit http://localhost:8000
   ```

2. **Play the Game**
   - Desktop: Use arrow keys to move tiles
   - Mobile: Swipe in any direction
   - Combine tiles with the same number to reach 2048!

## Deployment Instructions

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   # In your project directory
   vercel
   
   # Follow prompts:
   # - Set up and deploy: Y
   # - Which scope: (select your account)
   # - Link to existing project: N
   # - Project name: farcaster-2048
   # - Directory: ./
   # - Override settings: N
   ```

3. **Get your production URL**
   - Your app will be live at: `https://farcaster-2048.vercel.app`

### Deploy to Netlify

1. **Using Netlify Drop**
   - Visit [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag your project folder into the browser
   - Get instant URL

2. **Using Netlify CLI**
   ```bash
   npm i -g netlify-cli
   netlify deploy
   netlify deploy --prod
   ```

3. **Using Git**
   - Push to GitHub
   - Connect repo at [app.netlify.com](https://app.netlify.com)
   - Auto-deploy on push

## Register as Farcaster Mini App

### Prerequisites
- Deployed app with HTTPS URL
- Farcaster account with FID
- Updated manifest URLs

### Steps to Register

1. **Update farcaster-manifest.json**
   Replace all `https://yourdomain.com` with your actual deployed URL:
   ```json
   {
     "frame": {
       "homeUrl": "https://your-app.vercel.app/",
       "iconUrl": "https://your-app.vercel.app/icon-192.png",
       ...
     }
   }
   ```

2. **Add Required Assets**
   Create and upload:
   - `icon-192.png` (192x192px app icon)
   - `splash.png` (512x512px splash screen)
   - `preview.png` (1200x630px OG image)

3. **Register via Warpcast**
   - Open Warpcast
   - Go to Settings → Developer
   - Click "Register Mini App"
   - Enter your app URL
   - Warpcast will fetch the manifest

4. **Register via Farcaster Protocol**
   ```javascript
   // Use Farcaster Hub API
   const registration = {
     fid: YOUR_FID,
     app_url: "https://your-app.vercel.app/",
     manifest_url: "https://your-app.vercel.app/farcaster-manifest.json"
   };
   // POST to Farcaster Hub
   ```

## Integrating Real Farcaster API

The current implementation uses mock Farcaster integration. To connect real Farcaster:

### Option 1: Farcaster Connect SDK

1. **Install SDK**
   ```html
   <script src="https://unpkg.com/@farcaster/connect@latest"></script>
   ```

2. **Replace mock in app.js**
   ```javascript
   async shareToFarcaster() {
     const client = new FarcasterConnect({
       appName: "2048 Game",
       appIcon: "https://your-app.com/icon.png"
     });
     
     await client.authenticate();
     
     const cast = await client.cast({
       text: message,
       embeds: [{ url: window.location.href }]
     });
   }
   ```

### Option 2: Direct Warpcast API

1. **Use Warpcast intent**
   ```javascript
   const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}`;
   window.open(warpcastUrl, '_blank');
   ```

### Option 3: Farcaster Frames

1. **Add Frame meta tags**
   ```html
   <meta property="fc:frame" content="vNext" />
   <meta property="fc:frame:image" content="https://your-app.com/preview.png" />
   <meta property="fc:frame:button:1" content="Play Game" />
   <meta property="fc:frame:button:1:action" content="link" />
   <meta property="fc:frame:button:1:target" content="https://your-app.com" />
   ```

2. **Handle Frame interactions**
   ```javascript
   // Listen for frame messages
   window.addEventListener('message', (event) => {
     if (event.data.type === 'fc:frame:button:click') {
       // Handle frame button clicks
     }
   });
   ```

## Environment Variables

For production, add these to your deployment:

```env
FARCASTER_APP_FID=12345
FARCASTER_APP_KEY=your-app-key
FARCASTER_HUB_URL=https://hub.farcaster.xyz
PUBLIC_URL=https://your-app.vercel.app
```

## Testing Farcaster Integration

1. **Test in Warpcast**
   - Open your deployed URL in Warpcast browser
   - Play game and try sharing
   - Check if parent frame receives messages

2. **Test Frame Preview**
   - Use [Farcaster Frame Validator](https://warpcast.com/~/developers/frames)
   - Enter your URL
   - Verify frame renders correctly

3. **Debug Console**
   ```javascript
   // Add to app.js for debugging
   window.addEventListener('message', (e) => {
     console.log('Frame message:', e.data);
   });
   ```

## Customization

### Change Colors
Edit `styles.css`:
```css
.tile-2048 { 
  background: #edc22e; /* Your color */
}
```

### Adjust Animation Speed
```css
.tile {
  transition: all 0.15s; /* Change duration */
}
```

### Modify Board Size
In `app.js`:
```javascript
this.size = 5; // 5x5 board instead of 4x4
```

## Browser Support

- ✅ Chrome 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Mobile Safari
- ✅ Chrome Mobile

## Performance Optimization

- Minimal DOM manipulation
- CSS transitions for animations
- LocalStorage for persistence
- Efficient swipe detection
- Optimized tile rendering

## Security Considerations

- No external dependencies
- Content Security Policy ready
- XSS protection via sanitization
- CORS-friendly for embedding

## Troubleshooting

**Game not loading?**
- Check console for errors
- Ensure all files are in same directory
- Verify HTTPS in production

**Sharing not working?**
- Check if in Farcaster client
- Verify Web Share API support
- Test clipboard fallback

**Touch controls unresponsive?**
- Check viewport meta tag
- Test touch event listeners
- Verify CSS touch-action

## License

MIT License - Feel free to modify and distribute

## Contributing

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Support

For issues or questions:
- Open an issue on GitHub
- Post in /dev-2048 on Farcaster
- Check Farcaster developer docs

## Credits

- Original 2048 by Gabriele Cirulli
- Farcaster protocol by Merkle Manufactory
- Built for the Farcaster ecosystem

---

Built with ❤️ for Farcaster