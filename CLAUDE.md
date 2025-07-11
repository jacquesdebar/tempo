# Claude Development Guide - Tempo

## Project Overview
Tempo is a board game timer web application. Before making any changes, please read:
- `PROJECT.md` - Full project specification, features, and long-term goals
- `README.md` - User-facing documentation

## Key Project Files
- `index.html` - Single page application structure
- `app.js` - Core application logic and state management
- `styles.css` - Styling with CSS custom properties
- `vercel.json` - Deployment configuration

## Development Guidelines

### Code Style
- Use vanilla JavaScript (no frameworks)
- Follow existing patterns in the codebase
- Maintain mobile-first responsive design
- Keep accessibility in mind (ARIA labels, keyboard navigation)

### State Management
- Game state is managed in `app.js` with a central `gameState` object
- LocalStorage is used for persistence
- No external state management libraries

### Testing Approach
- Manual testing on multiple viewport sizes
- Test all three turn order modes
- Verify localStorage persistence
- Check performance on low-end devices

### Common Tasks

#### Adding a New Feature
1. Check PROJECT.md for alignment with project goals
2. Update the gameState structure if needed
3. Add UI elements to index.html
4. Implement logic in app.js
5. Style with CSS variables from styles.css
6. Test on mobile and desktop

#### Fixing Bugs
1. Reproduce the issue locally
2. Check browser console for errors
3. Test fix across different game modes
4. Ensure localStorage data isn't corrupted

#### Improving Performance
1. Profile with browser DevTools
2. Minimize DOM manipulations
3. Use requestAnimationFrame for animations
4. Keep the app under 100KB total

### Deployment
- Hosted on Vercel as a static site
- Automatic deployments from main branch
- No build process required
- URL: Deployed via jacquesdebar's Vercel account

### Future Considerations
See PROJECT.md for planned features including:
- Multiplayer sync
- Advanced analytics  
- Game templates
- Data export options

### Important Notes
- Keep the app simple and fast
- Prioritize user experience over features
- All data stays local (privacy-first)
- No external dependencies beyond dev tools