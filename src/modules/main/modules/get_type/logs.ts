import { ChangeTypes } from "src/domain";

export const getLogs = () => {
  return {
    typeCheckingHeader: (type: ChangeTypes) => {
      console.log(`#### Testing For Type ${type} ####`);
    },
    noMatchingTypes: () => {
      console.log("There were no matching types");
    },
    mustHaveHeader: () => {
      console.log(`-- Testing Must Have --`);
    },
    pathViolation: (path: string) => {
      console.log(`\t violation: ${path}`);
    },
    mustNotHaveHeader: () => {
      console.log(`-- Testing Must Not Have --`);
    },
    isType: (type: ChangeTypes) => {
      console.log(`!! is type ${type}`);
    }
  };
};
