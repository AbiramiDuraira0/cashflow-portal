import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoryPage } from './category.page';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CategoryPage],
  declarations: [],
  exports: [CategoryPage]
})
export class CategoryModule {}