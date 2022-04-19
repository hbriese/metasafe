export const SafeEvent = {
  Deposit: 'Deposit',
  GroupAdded: 'GroupAdded',
  GroupRemoved: 'GroupRemoved',
};

export const SafeError = {
  OnlyCallableBySafe: 'OnlyCallableBySafe',
  NotPrimaryApprover: 'NotPrimaryApprover',
  TotalGroupWeightLessThan100Percent: 'TotalGroupWeightLessThan100Percent',
  TotalApprovalWeightsInsufficient: 'TotalApprovalWeightsInsufficient',
  ExecutionReverted: 'ExecutionReverted',
};