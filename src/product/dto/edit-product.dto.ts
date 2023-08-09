import { CreateProductDto } from './create-product.dto';

export type EditProductDto = Partial<
  Exclude<CreateProductDto, 'subCategories'>
> & { id: number };
