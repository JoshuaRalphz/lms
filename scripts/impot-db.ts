import { exec } from 'child_process';

// Define the MySQL command
const command = `mysql -u avnadmin -pAVNS_cQS95UcAZrIO89525Ao defaultdb < C:\\Users\\solom\\OneDrive\\Desktop\\test\\lmsAPP\\backup.sql`;

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Import failed: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Import stderr: ${stderr}`);
    return;
  }
  console.log(`Import successful`);
});