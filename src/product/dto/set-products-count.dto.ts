export interface SetProductsCountDto {
  productId: number;
  productsCount: SetProductCountDto[];
}

export interface SetProductCountDto {
  color: string;
  size: string;
  count: number;
}
