import express, { Request, Response } from "express";
import BelieveCryptoBot from "./bot.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const bot = new BelieveCryptoBot();

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/status", (req: Request, res: Response) => {
  res.json(bot.getStatus());
});

app.post("/start", async (req: Request, res: Response) => {
  try {
    await bot.start();
    res.json({ message: "Bot started successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

app.post("/stop", (req: Request, res: Response) => {
  try {
    bot.stop();
    res.json({ message: "Bot stopped successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

app.post("/restart", async (req: Request, res: Response) => {
  try {
    bot.stop();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
    await bot.start();
    res.json({ message: "Bot restarted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

app.post("/pause", (req: Request, res: Response) => {
  try {
    bot.pause();
    res.json({ message: "Bot paused successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

app.post("/resume", (req: Request, res: Response) => {
  try {
    bot.resume();
    res.json({ message: "Bot resumed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

app.put("/handles", (req: Request, res: Response) => {
  try {
    const { handles } = req.body;
    if (!Array.isArray(handles)) {
      return res.status(400).json({ error: "Handles must be an array" });
    }
    bot.updateHandles(handles);
    return res.json({ message: "Handles updated successfully", handles });
  } catch (error) {
    return res
      .status(500)
      .json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});


app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
<html>
<head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jersey+20&display=swap" rel="stylesheet">
    <title>Believe-a-Tron 9000 Dashboard</title>
    <style>
        body { 
            background: linear-gradient(135deg, rgb(18, 18, 18) 0%, rgb(35, 35, 35) 50%, rgb(18, 18, 18) 100%);
            background-attachment: fixed;
            color: #fff; 
            font-family: "Jersey 20", sans-serif; 
            margin: 40px;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
        
        h1 {
            text-align: center;
            font-size: 3em;
            text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00, 0 0 60px #00ff00;
            margin-bottom: 30px;
            background: linear-gradient(45deg, #00ff00);
            background-size: 400% 400%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: rainbow 3s ease-in-out infinite;
        }
        
        @keyframes rainbow {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .status { 
            padding: 20px; 
            border: 3px solid #333;
            border-radius: 15px;
            margin: 20px 0;
            box-shadow: 
                inset 0 0 20px rgba(255, 255, 255, 0.1),
                0 0 20px rgba(0, 0, 0, 0.8),
                0 5px 15px rgba(0, 0, 0, 0.5);
            background: linear-gradient(145deg, rgba(40, 40, 40, 0.9), rgba(20, 20, 20, 0.9));
            backdrop-filter: blur(10px);
        }
        
        .running { 
            background: linear-gradient(145deg, rgba(34, 139, 34, 0.8), rgba(20, 100, 20, 0.8));
            border-color: #00ff00;
            box-shadow: 
                inset 0 0 20px rgba(0, 255, 0, 0.2),
                0 0 30px rgba(0, 255, 0, 0.4),
                0 5px 15px rgba(0, 0, 0, 0.5);
        }
        
        .stopped { 
            background: linear-gradient(145deg, rgba(255, 0, 0, 0.8), rgba(180, 0, 0, 0.8));
            border-color: #ff0000;
            box-shadow: 
                inset 0 0 20px rgba(255, 0, 0, 0.2),
                0 0 30px rgba(255, 0, 0, 0.4),
                0 5px 15px rgba(0, 0, 0, 0.5);
        }
        
        .paused { 
            background: linear-gradient(145deg, rgba(255, 165, 0, 0.8), rgba(200, 120, 0, 0.8));
            border-color: #FFA500;
            box-shadow: 
                inset 0 0 20px rgba(255, 165, 0, 0.2),
                0 0 30px rgba(255, 165, 0, 0.4),
                0 5px 15px rgba(0, 0, 0, 0.5);
        }
        
        button { 
            font-family: "Jersey 20", sans-serif; 
            font-size: 1.2em;
            padding: 15px 30px; 
            margin: 10px; 
            cursor: pointer; 
            border: 3px solid;
            border-radius: 12px;
            transition: all 0.3s ease-in-out;
            position: relative;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
            box-shadow: 
                0 8px 0 rgba(255, 255, 255, 0.7),
                0 12px 20px rgba(255, 255, 255, 0.4);
        }
        
        button:hover { 
            transform: translateY(-5px);
            box-shadow: 
                0 12px 0 rgba(255, 255, 255, 0.7),
                0 16px 25px rgba(255, 255, 255, 0.5);
        }
        
        button:active {
            transform: translateY(2px);
            box-shadow: 
                0 4px 0 rgba(0, 0, 0, 0.3),
                0 6px 10px rgba(0, 0, 0, 0.4);
        }
        
        #start-button { 
            background: linear-gradient(145deg, #32cd32, #228B22);
            color: #fff;
            border-color: #00ff00;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        #start-button:hover {
            background: linear-gradient(145deg, #3ee83e, #2eb82e);
            box-shadow: 
                0 12px 0 rgba(255, 255, 255, 0.7),
                0 16px 25px rgba(255, 255, 255, 0.5),
                0 0 20px rgba(0, 255, 0, 0.3);
        }
        
        #stop-button { 
            background: linear-gradient(145deg, #ff4444, #cc0000);
            color: #fff;
            border-color: #ff0000;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        #stop-button:hover {
            background: linear-gradient(145deg, #ff6666, #dd0000);
            box-shadow: 
                0 12px 0 rgba(255, 255, 255, 0.7),
                0 16px 25px rgba(255, 255, 255, 0.5),
                0 0 20px rgba(255, 0, 0, 0.3);
        }
        
        #restart-button { 
            background: linear-gradient(145deg, #ffaa00, #cc8800);
            color: #fff;
            border-color: #FFA500;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        #restart-button:hover {
            background: linear-gradient(145deg, #ffcc33, #dd9900);
            box-shadow: 
                0 12px 0 rgba(255, 255, 255, 0.7),
                0 16px 25px rgba(255, 255, 255, 0.5),
                0 0 20px rgba(255, 165, 0, 0.3);
        }
        
        #refresh-button { 
            background: linear-gradient(145deg, #4444ff, #0000cc);
            color: #fff;
            border-color: #0066ff;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        #refresh-button:hover {
            background: linear-gradient(145deg, #6666ff, #0000dd);
            box-shadow: 
                0 12px 0 rgba(255, 255, 255, 0.7),
                0 16px 25px rgba(255, 255, 255, 0.5),
                0 0 20px rgba(0, 100, 255, 0.3);
        }
        
        #pause-button { 
            background: linear-gradient(145deg, #ffaa00, #cc8800);
            color: #fff;
            border-color: #FFA500;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        #pause-button:hover {
            background: linear-gradient(145deg, #ffcc33, #dd9900);
            box-shadow: 
                0 12px 0 rgba(255, 255, 255, 0.7),
                0 16px 25px rgba(255, 255, 255, 0.5),
                0 0 20px rgba(255, 165, 0, 0.3);
        }
        
        #resume-button { 
            background: linear-gradient(145deg, #32cd32, #228B22);
            color: #fff;
            border-color: #00ff00;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        #resume-button:hover {
            background: linear-gradient(145deg, #3ee83e, #2eb82e);
            box-shadow: 
                0 12px 0 rgba(255, 255, 255, 0.7),
                0 16px 25px rgba(255, 255, 255, 0.5),
                0 0 20px rgba(0, 255, 0, 0.3);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .status h3 {
            margin-top: 0;
            font-size: 1.5em;
            text-shadow: 0 0 10px currentColor;
        }
        
        .status p {
            margin: 10px 0;
            font-size: 1.1em;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <h1>Believe-a-Tron 9000 Dashboard</h1>
    <div id="status" class="status">Loading...</div>
    <div class="button-container">
        <button id="start-button" onclick="startBot()">Start Bot</button>
        <button id="stop-button" onclick="stopBot()">Stop Bot</button>
        <button id="restart-button" onclick="restartBot()">Restart Bot</button>
        <button id="pause-button" onclick="pauseBot()">Pause Bot</button>
        <button id="resume-button" onclick="resumeBot()">Resume Bot</button>
        <button id="refresh-button" onclick="refreshStatus()">Refresh Status</button>
    </div>
    
    <script>
        async function refreshStatus() {
            try {
                const response = await fetch('/status');
                const status = await response.json();
                const statusDiv = document.getElementById('status');
                
                let statusClass = 'status ';
                let statusText = '';
                if (!status.isRunning) {
                    statusClass += 'stopped';
                    statusText = 'Stopped';
                } else if (status.isPaused) {
                    statusClass += 'paused';
                    statusText = 'Paused';
                } else {
                    statusClass += 'running';
                    statusText = 'Running';
                }
                
                statusDiv.className = statusClass;
                statusDiv.innerHTML = \`
                    <h3>Bot Status: \${statusText}</h3>
                    <p>Monitored Handles: \${status.monitoredHandles.join(', ')}</p>
                    <p>Tweets Processed: \${status.stats.tweetsProcessed}</p>
                    <p>Tokens Analyzed: \${status.stats.tokensAnalyzed}</p>
                    <p>Purchases Made: \${status.stats.purchasesMade}</p>
                    <p>Last Run: \${status.stats.lastRun || 'Never'}</p>
                \`;
                
                
                updateButtonVisibility(status);
            } catch (error) {
                console.error('Error fetching status:', error);
            }
        }
        
        function updateButtonVisibility(status) {
            const startButton = document.getElementById('start-button');
            const stopButton = document.getElementById('stop-button');
            const restartButton = document.getElementById('restart-button');
            const pauseButton = document.getElementById('pause-button');
            const resumeButton = document.getElementById('resume-button');
            
            if (!status.isRunning) {
                
                startButton.style.display = 'inline-block';
                stopButton.style.display = 'none';
                restartButton.style.display = 'none';
                pauseButton.style.display = 'none';
                resumeButton.style.display = 'none';
            } else if (status.isPaused) {
                
                startButton.style.display = 'none';
                stopButton.style.display = 'inline-block';
                restartButton.style.display = 'inline-block';
                pauseButton.style.display = 'none';
                resumeButton.style.display = 'inline-block';
            } else {
                startButton.style.display = 'none';
                stopButton.style.display = 'inline-block';
                restartButton.style.display = 'inline-block';
                pauseButton.style.display = 'inline-block';
                resumeButton.style.display = 'none';
            }
        }
        
        async function startBot() {
            try {
                await fetch('/start', { method: 'POST' });
                refreshStatus();
            } catch (error) {
                console.error('Error starting bot:', error);
            }
        }
        
        async function stopBot() {
            try {
                await fetch('/stop', { method: 'POST' });
                refreshStatus();
            } catch (error) {
                console.error('Error stopping bot:', error);
            }
        }
        
        async function restartBot() {
            try {
                await fetch('/restart', { method: 'POST' });
                refreshStatus();
            } catch (error) {
                console.error('Error restarting bot:', error);
            }
        }
        
        async function pauseBot() {
            try {
                await fetch('/pause', { method: 'POST' });
                refreshStatus();
            } catch (error) {
                console.error('Error pausing bot:', error);
            }
        }
        
        async function resumeBot() {
            try {
                await fetch('/resume', { method: 'POST' });
                refreshStatus();
            } catch (error) {
                console.error('Error resuming bot:', error);
            }
        }
        
        // Refresh status every 5 seconds
        setInterval(refreshStatus, 5000);
        refreshStatus(); // Initial load
    </script>
</body>
</html>
  `);
});

app.listen(port, () => {
  console.log(`Bot management server running on port ${port}`);
  console.log(`Dashboard available at http://localhost:${port}`);
});

if (process.env.AUTO_START_BOT === "true") {
  bot.start();
}
