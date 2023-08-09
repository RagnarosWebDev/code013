export interface CreateProductDto {
  readonly title: string;
  readonly description: string;
  readonly composition: string;
  readonly vendorCode: number;
  readonly price: number;
  readonly colors: string[] | string;
  readonly sizes: string[] | string;
  readonly recommended: boolean;
  readonly subCategories: number[] | number;
}
