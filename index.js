const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config(); // لضمان قراءة متغيرات البيئة في كل البيئات

// 1. تهيئة البوت
// نستخدم GatewayIntentBits.Guilds فقط لأنه كافٍ لأوامر Slash Commands
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 2. متغيرات البيئة
// نستخدم DISCORD_TOKEN و BACKEND_URL من متغيرات بيئة Railway
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL;

// 3. عند جاهزية البوت
client.once('ready', () => {
    console.log(`Bot is online! Logged in as ${client.user.tag}`);
    console.log(`Backend URL: ${BACKEND_URL}`);
    // تأكيد وجود التوكن (للتشخيص)
    if (!DISCORD_TOKEN) {
        console.error("FATAL ERROR: DISCORD_TOKEN is missing!");
    }
});

// 4. التعامل مع الأوامر
client.on('interactionCreate', async interaction => {
    // نتأكد فقط من التعامل مع أوامر التطبيق (Slash Commands)
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'like') {
        // الرد الفوري لتجنب انتهاء مهلة التفاعل (3 ثواني)
        await interaction.deferReply({ ephemeral: false });

        // استخراج معرف اللاعب من خيارات الأمر
        const playerId = interaction.options.getString('player_id');

        if (!playerId) {
            return interaction.editReply({ content: 'الرجاء تحديد معرف اللاعب الصحيح. مثال: `/like 12345678`' });
        }

        try {
            // إرسال الأمر إلى الخادم الخلفي (Vercel)
            const response = await axios.post(`${BACKEND_URL}/set-command`, {
                task: 'like', // نوع المهمة
                player_id: playerId // معرف اللاعب
            });

            if (response.status === 200) {
                // الرد بتأكيد نجاح الإرسال
                await interaction.editReply({ content: `✅ تم إرسال أمر الإعجاب بنجاح للاعب ID: **${playerId}**. سيتم تنفيذه بواسطة جميع المودات النشطة خلال 30 ثانية.` });
            } else {
                // الرد في حالة فشل الاتصال بالخادم الخلفي
                await interaction.editReply({ content: `❌ حدث خطأ أثناء إرسال الأمر إلى الخادم الخلفي. الحالة: ${response.status}.` });
            }
        } catch (error) {
            console.error('Error sending command to backend:', error.message);
            // الرد في حالة وجود خطأ في الاتصال
            await interaction.editReply({ content: '❌ حدث خطأ في الاتصال بالخادم الخلفي. الرجاء التأكد من أن متغير `BACKEND_URL` صحيح ويعمل.' });
        }
    }
});

// 5. تسجيل الدخول إلى ديسكورد
if (!DISCORD_TOKEN) {
    console.error("FATAL ERROR: DISCORD_TOKEN is not set. Bot cannot log in.");
} else {
    client.login(DISCORD_TOKEN).catch(err => {
        console.error("Failed to log in to Discord. Check DISCORD_TOKEN validity.", err);
    });
}
