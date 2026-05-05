# Privacy Policy for Openify Extract

**Effective Date:** May 5, 2026

## Overview

Openify Extract ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains our data collection and processing practices when you use the Openify Extract Chrome Extension ("the Extension").

## Data Collection and Processing

**We do not collect, store, transmit, or share any of your personal data.**

The Openify Extract extension is designed to operate entirely locally on your device. 

- **Local Execution:** All data extraction, parsing, and formatting (such as generating CSV or JSON files) occur strictly within your web browser on your host machine.
- **No External Servers:** We do not operate any backend servers, analytics services, or external databases in connection with this extension.
- **No Telemetry:** We do not track your usage, monitor the playlists you extract, or collect any telemetry data.
- **Data Storage:** Any temporary data collected during the extraction process is stored locally in your browser's memory and is only used to generate the final export file you request. This data can be cleared at any time using the "Clear Data" button within the extension's popup interface.

## Permissions

The extension requests the minimum necessary permissions to function:
- **`activeTab` & `scripting`:** Used strictly to read the track information from the Spotify playlist currently open in your active browser tab.
- **`storage`:** Used to temporarily hold the extracted track data so it can be formatted and exported.
- **`downloads`:** Used solely to save the final exported CSV or JSON file to your local device.
- **`host_permissions` (`https://open.spotify.com/*`):** Required to allow the extension to inject the extraction script into Spotify web pages.

## Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be reflected in this document and included in future updates of the extension. Because we do not collect any user information, we have no way to notify you of changes directly.

## Contact

If you have any questions or concerns about this Privacy Policy, please open an issue on our [GitHub repository](https://github.com/Arcioth/openify-extract).
