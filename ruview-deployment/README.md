# RuView Production Deployment Package

Official, zero-intervention, edge-first spatial intelligence deployment package for **RuView** (`ruvnet/ruview`).

## Quick Start
```bash
./install-ruview.sh
```

## Management Commands
```bash
./ruview status
./ruview doctor
./ruview test
./ruview flash
./ruview backup
./ruview update
./ruview uninstall
```

## Directory Architecture
```text
ruview-deployment/
├── install-ruview.sh        # Primary zero-intervention installer
├── uninstall-ruview.sh      # Clean system uninstaller
├── update-ruview.sh         # System updater & model refresher
├── ruview                   # Management CLI command
├── .env.example             # Safe environment configuration template
├── .gitignore               # Secrets and build ignore policy
├── docker-compose.yml       # Production container stack
├── scripts/                 # Hardware detection & flashing scripts
├── systemd/                 # Linux boot service unit file
├── home-assistant/          # Home Assistant MQTT integration guide
├── tests/                   # Automated deployment test runner
└── README.md                # Package documentation
```
