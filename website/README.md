# AutoWeb Website

This is a dependency-free static landing page for AutoWeb. It is designed to deploy directly from this directory on Vercel.

## Deploy to Vercel

1. Import the AutoWeb GitHub repository into Vercel.
2. Set **Root Directory** to `website`.
3. Use the **Other** framework preset. Leave the build command and install command empty; use `.` as the output directory if Vercel requests one.
4. Deploy. No environment variables are required for the site.

The extension download is `AutoWeb-Chrome.zip` in this directory. Keep this file updated whenever the extension package changes.

## Rebuild the team download

From the repository root, build the extension:

```powershell
pnpm build
```

Then update the download archive from the generated `dist` directory:

```powershell
Compress-Archive -Path .\dist\* -DestinationPath .\website\AutoWeb-Chrome.zip -Force
```

Commit the updated archive along with the website changes. The archive contains the built extension files at its root, including `manifest.json`.

## Install from the site

The site downloads an unpacked-install package; it does not install the extension from a browser store. A teammate downloads and extracts the ZIP, opens `chrome://extensions` or `edge://extensions`, enables Developer mode, chooses **Load unpacked**, and selects the extracted folder containing `manifest.json`.
