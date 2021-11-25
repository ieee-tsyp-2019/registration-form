![TSYP 2019](src/assets/images/tsyp-black-logo.png?raw=true "TSYP 2019")

# TSYP 2019 Registration Form

Registration form for TSYP 2019.

## What is TSYP?
> The TSYP congress is the IEEE Tunisia section’s Annual Meeting where more
> than 1,000 engineering students from several Tunisian public and private
> universities, as well as young professionals, gather together to learn
> further details about the IEEE technical, professional, and education
> benefits; and to discuss the future engineering challenges worldwide and
> in Tunisia. (More information on [tsyp.ieee.tn](https://tsyp.ieee.tn
> "tsyp.ieee.tn"))

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
