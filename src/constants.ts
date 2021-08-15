import moment from "moment-timezone";

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN as string;
export const WITHDRAWN_CUTOFF = moment().subtract(1, "year");

/** for cleaning strings so they can be safely compared */
export const cleanString = (str: string) => {
  return str.toLowerCase().replace(/\s/, "");
};

export enum FrontMatterAttributes {
  status = "status",
  eip = "eip",
  author = "author"
}

export enum EipStatus {
  draft = "draft",
  withdrawn = "withdrawn",
  lastCall = "last call",
  review = "review",
  final = "final",
  idea = "idea",
  living = "living",
  stagnant = "stagnant"
}

export const WITHDRAWABLE_STATUSES: EipStatus[] = [
  EipStatus.draft,
  EipStatus.review,
  EipStatus.stagnant,
  EipStatus.lastCall
];
