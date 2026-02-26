import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Category = {
  id: string;
  name: string;
  color: string;     // accent for tile
  icon?: string;     // e.g., "💰", "🍔"
  count?: number;    // # of items in this category (optional)
  budget?: number;   // monthly budget (optional)
  spent?: number;    // spent this month (optional)
};

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss']
})
export class CategoryPage implements OnInit {
  // Loading state to show skeletons initially
  loading = true;

  // Quick search/filter
  query = '';

  // Mock data — replace with API call
  categories: Category[] = [
    { id: '1', name: 'Income',   color: '#22c55e', icon: '💼', count: 12, budget: 0,    spent: 0 },
    { id: '2', name: 'Food',     color: '#f97316', icon: '🍔', count: 32, budget: 8000, spent: 5200 },
    { id: '3', name: 'Bills',    color: '#06b6d4', icon: '💡', count: 9,  budget: 6000, spent: 4100 },
    { id: '4', name: 'Travel',   color: '#a855f7', icon: '✈️', count: 4,  budget: 12000, spent: 2000 },
    { id: '5', name: 'Shopping', color: '#ef4444', icon: '🛍️', count: 7,  budget: 5000, spent: 1800 },
    { id: '6', name: 'Health',   color: '#14b8a6', icon: '❤️', count: 5,  budget: 4000, spent: 900 }
  ];

  skeletons = Array.from({ length: 6 });

  ngOnInit(): void {
    // Simulate data fetch
    setTimeout(() => (this.loading = false), 900);
  }

  get filtered(): Category[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories.filter(c => c.name.toLowerCase().includes(q));
  }

  percentSpent(cat: Category): number | null {
    if (!cat.budget || cat.budget <= 0) return null;
    return Math.min(100, Math.round((cat.spent ?? 0) * 100 / cat.budget));
  }

  // Actions
  onAdd(): void {
    const id = Date.now().toString();
    this.categories = [
      {
        id,
        name: `New Category ${this.categories.length + 1}`,
        color: '#3b82f6',
        icon: '📁',
        count: 0,
        budget: 0,
        spent: 0
      },
      ...this.categories
    ];
  }

  onEdit(cat: Category): void {
    this.categories = this.categories.map(c =>
      c.id === cat.id ? { ...c, name: `${c.name} (Edited)` } : c
    );
  }

  onDelete(cat: Category): void {
    this.categories = this.categories.filter(c => c.id !== cat.id);
  }

  onOpen(_cat: Category): void {
    // Hook for router navigation/details drawer.
  }
}
``