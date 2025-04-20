export type ProjectQuantityDto = {
  id: string;
  code: string;
  projectId: string;
  quantityItemCode: string;
  quantityItemName: string;
  quantity: number;
  unit: string;
  description?: string;
  createdBy: string;
  updatedBy: string;
  createdatetime: Date;
  updatedatetime: Date;
};
