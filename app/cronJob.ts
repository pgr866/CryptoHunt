import cron from 'node-cron';
import axios from 'axios';

cron.schedule('* * * * *', async () => {
  try {
    await axios.post('http://localhost:3000/api/scrape');
  } catch (error) {
    console.error('Error scraping news:', error);
  }
});
