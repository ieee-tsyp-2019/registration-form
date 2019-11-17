export class UserProfile {

  constructor(
    public type: string,
    public email: string,
    public memberNumber: string,
    public fullName: string,
    public phoneNumber: string,
    public dateOfBirth: string,
    public studentBranch: string,
    public accommodation: string,
    public organization: string,
    public position: string,
    public educationalInstitution: string
  ) {
  }

}
