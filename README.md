# Flappy Bird

A simple Flappy Bird clone built with HTML5 Canvas, using your own bird, pipe, and background artwork.

## How to run it

You don't need to install anything.

**Easiest way:** just double-click `index.html` and it will open in your browser.

**If images don't load** (some browsers block local file access for security), run a tiny local server instead:

1. Open a terminal / command prompt in this folder.
2. If you have Python installed, run:
   ```
   python -m http.server 8000
   ```
   (On some systems the command is `python3` instead of `python`.)
3. Open your browser and go to: `http://localhost:8000`

Alternatively, if you use VS Code, install the "Live Server" extension, right-click `index.html`, and choose "Open with Live Server".

## Controls

- **Click / Tap** the screen, or press **Space** / **Arrow Up** to flap.
- Avoid the pipes and the ground.
- Your score goes up each time you pass through a pipe gap.

## Folder structure

```
flappy-bird-game/
├── index.html        # Main game page
├── style.css          # Styling
├── script.js          # Game logic
├── assets/
│   ├── bird.png            # Cleaned-up bird sprite (background removed)
│   ├── pipe_top.png        # Cleaned-up top pipe (background removed)
│   ├── pipe_bottom.png     # Cleaned-up bottom pipe (background removed)
│   ├── background.jpg      # Sky / city background art
│   └── originals/          # Your original uploaded images, unedited
└── README.md
```

## Customizing

- Tweak gravity, flap strength, pipe speed/gap, etc. at the top of `script.js` (the `GRAVITY`, `FLAP_VELOCITY`, `PIPE_SPEED`, and `PIPE_GAP` constants).
- Swap any image in `assets/` for your own art — just keep the same filename, or update the path in `script.js`.
