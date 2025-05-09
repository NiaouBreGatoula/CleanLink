<h1 align="center">CleanLink</h1>

<p align="center">
  <img src="https://github.com/user-attachments/assets/4e843321-ba57-46fd-8e9d-98cf9aa912ec" alt="CleanLink" width="700" />
</p>

CleanLink is a **simple** security-focused Discord bot designed to help server administrators protect their communities from malicious content. It integrates with the VirusTotal API to scan files and URLs in real-time and remove harmful messages from users who do not meet certain role requirements.

![showcase](https://github.com/user-attachments/assets/f751b0ae-2a4d-41f4-8ebd-91637ae6d04e)


## Features

- Scans all uploaded files and posted URLs using VirusTotal
- Automatically deletes messages that contain malicious content
- Role-based permissions to restrict scanning to specific users
- Logs incidents to a specified channel for administrator review
- Lightweight and efficient design for performance

## Installation
1. Clone the repository:

   ```bash
    git clone https://github.com/NiaouBreGatoula/cleanlink.git
   ```
   ```bash
   cd cleanlink
   ```
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a \`.env\` file and configure the following variables:

   ```env
   DISCORD_TOKEN=your_discord_bot_token
   VT_API_KEY=your_virustotal_api_key
   SAFE_ROLE_ID=role_id_that_bypasses_scans
   ```

4. Start the bot:

   ```
   node index.js
   ```

## Configuration

You can configure the bot behavior through environment variables or a config file depending on your setup. Make sure to set the appropriate role ID for trusted users and a logging channel to track any detected threats.

## VirusTotal API

This bot uses the VirusTotal Public API v3 to analyze files and URLs. Note that public API keys are subject to rate limits. For higher usage, consider applying for a premium API key.
Check reference here: https://docs.virustotal.com/reference/overview

## Usage

Once the bot is running and added to your server, it will automatically start scanning:

- Every file uploaded by a user without the safe role
- Every URL posted in a message from users without the safe role

If a threat is detected, the message will be deleted and a log will be sent to the channel.

## Contributing

Contributions are welcome. Please fork the repository and submit a pull request with a clear explanation of the changes.

## License

This project is licensed under the MIT License.
