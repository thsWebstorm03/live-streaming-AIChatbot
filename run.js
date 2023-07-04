const { exec } = require('child_process');

// Specify the path to your .sh file
const scriptPath = './run.sh';

// Execute the .sh file
exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
   if (error) {
      console.error(`Error executing script: ${error.message}`);
      return;
   }

   // Script executed successfully
   console.log('Script output:');
   console.log(stdout);

   if (stderr) {
      console.error('Script errors:');
      console.error(stderr);
   }
});
