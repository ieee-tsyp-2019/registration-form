# TSYP 2019 Registration Form [![Build Status](https://travis-ci.com/tildehacker/tsyp2019-registration-form.svg?token=TYqdpiSGpP2eqYwQydmq&branch=develop)](https://travis-ci.com/tildehacker/tsyp2019-registration-form)

Registration form for TSYP 2019.

## How to deploy
When running `firebase deploy`, Firebase CLI will try to deploy all hosting
targets (assumes they exist in every project specified in `.firebaserc`). Target
`tsyp2019-registration-form-development` is valid only for project
`tsyp2019-app-development` and target `tsyp2019-registration-form-production` is
valid only for project `tsyp2019-registration-form-production`. We need to
deploy everything except hosting type first, then deploy the specific hosting
target for production.
### Development
```bash
ng build
firebase deploy -P development --except hosting
firebase deploy -P development --only hosting:tsyp2019-registration-form-development
```
### Production
```bash
ng build --prod
firebase deploy -P production --except hosting
firebase deploy -P production --only hosting:tsyp2019-registration-form-production
```
