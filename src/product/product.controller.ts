import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { EditProductDto } from './dto/edit-product.dto';
import { ChangeStateDto } from './dto/change-state.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { GetByIdsDto } from './dto/get-by-ids.dto';
import { SetProductsCountDto } from './dto/set-products-count.dto';

@Controller('product')
export class ProductController {
  static files = FilesInterceptor('images', 15, {
    storage: diskStorage({
      destination: './images',
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}.${file.originalname.split('.').at(-1)}`);
      },
    }),
  });
  constructor(private productService: ProductService) {}

  @Post('/create')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './images',
        filename: (req, file, cb) => {
          cb(
            null,
            `${Math.random()}-${Date.now()}.${file.originalname
              .split('.')
              .at(-1)}`,
          );
        },
      }),
      limits: {
        fieldSize: 100 * 1024 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    return this.productService.create(dto, files);
  }

  @Post('/setVariants')
  async setVariants(@Body() dto: SetProductsCountDto) {
    return this.productService.updateProductsCount(dto);
  }

  @Post('edit')
  @UseInterceptors(AnyFilesInterceptor())
  async edit(
    @Body() dto: EditProductDto,
    @UploadedFiles()
    images?: Express.Multer.File[],
  ) {
    return this.productService.edit(
      dto,
      images?.length ? images.map((u) => u.filename) : undefined,
    );
  }

  @Post('/')
  async search(@Body() dto: FilterProductDto) {
    return this.productService.search(dto);
  }

  @Get('/:id')
  async getById(@Param('id') id: number) {
    return this.productService.getById(id);
  }

  @Post('/getByIds')
  async getByIds(@Body() dto: GetByIdsDto) {
    return this.productService.getByIds(dto);
  }

  @Post('/count')
  async count(@Body() dto: FilterProductDto) {
    return this.productService.searchCount(dto);
  }

  @Post('/changeState')
  async changeState(@Body() dto: ChangeStateDto) {
    return this.productService.changeState(dto);
  }
}
