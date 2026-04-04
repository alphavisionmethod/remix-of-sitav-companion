import type { RealityContractMeta, IrreversibilityClass as IrreversibilityClassEnum } from "./primitives";

export interface IrreversibilityClassDefinition {
  classLevel: IrreversibilityClassEnum;
  description: string;
  requiresDualApproval: boolean;
  cooldownMs?: number;
  meta: RealityContractMeta;
}

export type { IrreversibilityClassEnum as IrreversibilityClass };
