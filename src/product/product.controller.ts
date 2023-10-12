import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ChangeStateDto } from './dto/change-state.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { GetByIdsDto } from './dto/get-by-ids.dto';
import { SetProductsCountDto } from './dto/set-products-count.dto';
import { AdminGuard } from '../admin.guard';

@Controller('product')
export class ProductController {
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
  @UseGuards(AdminGuard)
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    return this.productService.create(dto, files);
  }

  @UseGuards(AdminGuard)
  @Post('/setVariants')
  async setVariants(@Body() dto: SetProductsCountDto) {
    return this.productService.updateProductsCount(dto);
  }

  @UseGuards(AdminGuard)
  @Post('/updateImages')
  async updateImages(@Body() dto) {
    return this.productService.updateImages(dto);
  }

  @UseGuards(AdminGuard)
  @Post('/uploadImage')
  @UseInterceptors(
    FileInterceptor('image', {
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
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    return { image: image.filename };
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

  @UseGuards(AdminGuard)
  @Post('/changeState')
  async changeState(@Body() dto: ChangeStateDto) {
    return this.productService.changeState(dto);
  }
}
