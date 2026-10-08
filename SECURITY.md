# Security Policy

## Supported versions

Security fixes target the latest published release and the `main` branch. Older
releases are not maintained. Please check whether the issue still occurs in the
latest version.

## Reporting a vulnerability

Please report suspected vulnerabilities through
[GitHub private vulnerability reporting](https://github.com/shettyh/yt-local-db/security/advisories/new).
A GitHub account is required. Reports are shared privately with the repository
maintainer.

Do not disclose vulnerabilities in public issues or pull requests before a fix
or coordinated disclosure. Include:

- The extension version and Chrome version.
- Steps to reproduce, expected behavior, and actual behavior.
- The potential impact and a minimal proof of concept, if available.

Use synthetic data. Do not include personal watch history, cookies, account
credentials, or other sensitive information.

## Security and privacy boundaries

YT Local DB stores watch history locally in the browser profile without
encryption. It does not provide anonymity from YouTube or protection from
someone with access to that profile. See [PRIVACY.md](PRIVACY.md) for the full
privacy boundary.
