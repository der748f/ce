const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

router.get('/student/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        
        const pythonProcess = spawn('python', [
            './python/lesson_recommender.py',
            studentId
        ]);

        let dataString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: 'Recommendation process failed' });
            }
            try {
                const recommendations = JSON.parse(dataString);
                res.json(recommendations);
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse recommendations' });
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
