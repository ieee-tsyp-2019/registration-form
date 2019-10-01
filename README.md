# TSYP 2019 Registration Form

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.6.

## How to deploy to production
When running `firebase deploy`, Firebase CLI will try to deploy all hosting
targets (assumes they exist in every project specified in `.firebaserc`). Target
`tsyp2019-registration-form-development` is valid only for project
`tsyp2019-app-development` and target `tsyp2019-registration-form-production` is
valid only for project `tsyp2019-registration-form-production`. We need to
deploy everything except hosting type first, then deploy the specific hosting
target for production.
```bash
firebase deploy -P production --except hosting
firebase deploy -P production --only hosting:tsyp2019-registration-form-production
```
