module.exports = {
  "main": "electron/main.js",
  "build": {
    "appId": "com.wolfie.east-customs-pricing",
    "productName": "East Customs Pricing",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
  "publish": [
      {
        "provider": "github",
        "owner": "FalconFANX",
        "repo": "East-Customs-Pricing"
      }
    ]
  }
}