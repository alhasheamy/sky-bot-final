const express = require('express');
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// åĞÇ ÇáãÊÛíÑ ÓíÎÒä ÇáãåãÉ ÇáÍÇáíÉ İí ĞÇßÑÉ ÇáÎÇÏã
let currentTask = {
    signal: false,
    task: null,
    player_id: null,
    timestamp: null
};

// 1. äŞØÉ ÇáæÕæá ÇáÊí íÓÊÏÚíåÇ ÈæÊ ÇáÏíÓßæÑÏ áæÖÚ ãåãÉ ÌÏíÏÉ
app.post('/set-command', (req, res) => {
    const { task, player_id } = req.body;

    // ÊÍŞŞ ÈÓíØ ãä ÇáÈíÇäÇÊ
    if (!task || !player_id) {
        return res.status(400).json({ error: 'Missing task or player_id' });
    }

    // ÊÍÏíË ÇáãåãÉ ÇáÍÇáíÉ æÊİÚíá ÇáÅÔÇÑÉ
    currentTask = {
        signal: true,
        task: task,
        player_id: player_id,
        timestamp: new Date().toISOString() // æŞÊ ÅäÔÇÁ ÇáãåãÉ
    };
    
    console.log('New command set:', currentTask);
    res.status(200).json({ message: 'Command set successfully!', data: currentTask });

    // ÅÚÇÏÉ ÊÚííä ÇáÅÔÇÑÉ ÊáŞÇÆíğÇ ÈÚÏ 5 ÏŞÇÆŞ
    setTimeout(() => {
        currentTask.signal = false;
        console.log('Signal automatically turned off after 5 minutes.');
    }, 5 * 60 * 1000); // 5 ÏŞÇÆŞ
});

// 2. äŞØÉ ÇáæÕæá ÇáÊí íİÍÕåÇ ÇáãæÏ ÈÔßá ÏæÑí (ßá 30-60 ËÇäíÉ)
app.get('/check-for-signal', (req, res) => {
    res.status(200).json({ signal: currentTask.signal });
});

// 3. äŞØÉ ÇáæÕæá ÇáÊí íÌáÈ ãäåÇ ÇáãæÏ ÊİÇÕíá ÇáãåãÉ
app.get('/get-task', (req, res) => {
    // äÑÓá ÇáãåãÉ İŞØ ÅĞÇ ßÇäÊ ÇáÅÔÇÑÉ ãİÚáÉ
    if (currentTask.signal) {
        res.status(200).json({ 
            task: currentTask.task, 
            player_id: currentTask.player_id,
            timestamp: currentTask.timestamp
        });
    } else {
        // ÅĞÇ áã Êßä åäÇß ÅÔÇÑÉ¡ äÑÓá ÑÏÇğ İÇÑÛÇğ
        res.status(200).json({ task: null });
    }
});

// äŞØÉ æÕæá ÇİÊÑÇÖíÉ ááÊÍŞŞ ãä Ãä ÇáÎÇÏã íÚãá
app.get('/', (req, res) => {
    res.send('Avakin Backend Server is running!');
});


// ÊÕÏíÑ ÇáÊØÈíŞ áíÚãá Úáì Vercel
module.exports = app;
