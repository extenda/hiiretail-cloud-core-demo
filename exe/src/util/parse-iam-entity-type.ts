export enum IamEntityType {
  ROLE = 'role',
  GROUP = 'group',
  NONE = 'none',
}

export function parseIamEntityType(type: string): IamEntityType {
  if (type.includes('role')) {
    return IamEntityType.ROLE;
  }

  if (type.includes('group')) {
    return IamEntityType.GROUP;
  }

  return IamEntityType.NONE;
}