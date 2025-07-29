// CustomizeTemplate - Customize template by merging multiple sources
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Save, Eye } from 'lucide-react';
import type { BaseTemplate, Category, DynamicTemplateItem } from '@/types/template.types';

interface CustomizeTemplateProps {
  baseTemplates: BaseTemplate[];
  suggestedCategories: Category[];
  onSave: (customTemplate: any) => void;
}

interface CustomItem extends DynamicTemplateItem {
  id: string;
  source_template?: string;
  selected: boolean;
}

export function CustomizeTemplate({ baseTemplates, suggestedCategories, onSave }: CustomizeTemplateProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableItems, setAvailableItems] = useState<CustomItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<CustomItem[]>([]);
  const [isEditingItem, setIsEditingItem] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    // Initialize with core categories
    const coreCategories = suggestedCategories
      .filter(cat => cat.is_system_default)
      .map(cat => cat.name);
    setSelectedCategories(coreCategories);

    // Extract items from base templates
    const allItems: CustomItem[] = [];
    
    baseTemplates.forEach((template, templateIndex) => {
      try {
        const templateData = template.template_data as any;
        const items = templateData.items || [];
        
        items.forEach((item: any, itemIndex: number) => {
          allItems.push({
            id: `${template.id}-${itemIndex}`,
            source_template: template.name,
            selected: false,
            category: item.category,
            title: item.title,
            description: item.description || '',
            instructions: item.instructions || '',
            priority: item.priority || 5,
            estimated_minutes: item.estimated_minutes || 30,
            is_mandatory: item.is_mandatory || false,
            generated_by: 'rule_based',
            item_data: item.item_data || {}
          });
        });
      } catch (error) {
        console.error('Error processing template:', error);
      }
    });

    setAvailableItems(allItems);
    
    // Auto-select high-priority items
    const autoSelected = allItems.filter(item => item.priority >= 8);
    setSelectedItems(autoSelected.map(item => ({ ...item, selected: true })));
    
    // Generate default template name
    if (baseTemplates.length > 0) {
      setTemplateName(`Custom Template (${baseTemplates[0].level || 'Mixed'} Level)`);
    }
  }, [baseTemplates, suggestedCategories]);

  const handleCategoryToggle = (categoryName: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryName]);
    } else {
      // Don't allow removing core categories
      const category = suggestedCategories.find(cat => cat.name === categoryName);
      if (!category?.is_system_default) {
        setSelectedCategories(prev => prev.filter(cat => cat !== categoryName));
        // Remove items from this category
        setSelectedItems(prev => prev.filter(item => item.category !== categoryName));
      }
    }
  };

  const handleItemToggle = (itemId: string, checked: boolean) => {
    const item = availableItems.find(i => i.id === itemId);
    if (!item) return;

    if (checked) {
      // Add item to selected
      if (!selectedItems.find(i => i.id === itemId)) {
        setSelectedItems(prev => [...prev, { ...item, selected: true }]);
      }
    } else {
      // Remove item from selected
      setSelectedItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const handleItemEdit = (itemId: string, updates: Partial<CustomItem>) => {
    setSelectedItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleAddCustomItem = () => {
    const newItem: CustomItem = {
      id: `custom-${Date.now()}`,
      selected: true,
      category: selectedCategories[0] || 'knowledge_and_insights',
      title: 'New Custom Item',
      description: 'Custom handover item',
      instructions: '',
      priority: 5,
      estimated_minutes: 30,
      is_mandatory: false,
      generated_by: 'manual'
    };
    
    setSelectedItems(prev => [...prev, newItem]);
    setIsEditingItem(newItem.id);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSave = () => {
    const customTemplate = {
      name: templateName,
      description: `Custom template with ${selectedItems.length} items across ${selectedCategories.length} categories`,
      categories: selectedCategories,
      items: selectedItems.map(item => ({
        category: item.category,
        title: item.title,
        description: item.description,
        instructions: item.instructions,
        priority: item.priority,
        estimated_minutes: item.estimated_minutes,
        is_mandatory: item.is_mandatory,
        generated_by: item.generated_by,
        item_data: item.item_data
      })),
      confidence_score: 0.8, // High confidence for customized templates
      requires_review: false,
      learning_mode: false
    };

    onSave(customTemplate);
  };

  const getItemsByCategory = (categoryName: string) => {
    return availableItems.filter(item => item.category === categoryName);
  };

  const getSelectedItemsByCategory = (categoryName: string) => {
    return selectedItems.filter(item => item.category === categoryName);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold">Customize Template</h3>
        <p className="text-muted-foreground">
          Select categories and items from similar templates to create your custom handover template.
        </p>
      </div>

      {/* Template Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Category and Item Selection */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.name);
                  const isCore = category.is_system_default;
                  
                  return (
                    <div key={category.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleCategoryToggle(category.name, checked as boolean)
                        }
                        disabled={isCore}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{category.display_name}</span>
                          {isCore && (
                            <Badge variant="secondary" className="text-xs">Core</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Available Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategories[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  {selectedCategories.slice(0, 4).map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category.replace(/_/g, ' ').slice(0, 10)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {selectedCategories.map((category) => (
                  <TabsContent key={category} value={category} className="space-y-2">
                    {getItemsByCategory(category).map((item) => {
                      const isSelected = selectedItems.some(si => si.id === item.id);
                      
                      return (
                        <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => 
                              handleItemToggle(item.id, checked as boolean)
                            }
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{item.title}</span>
                              <Badge variant="outline" className="text-xs">
                                P{item.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            <div className="text-xs text-muted-foreground">
                              From: {item.source_template}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Selected Items */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Selected Items ({selectedItems.length})</span>
                <Button size="sm" onClick={handleAddCustomItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedCategories.map((category) => {
                  const categoryItems = getSelectedItemsByCategory(category);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h5 className="font-medium text-sm mb-2">
                        {category.replace(/_/g, ' ')} ({categoryItems.length})
                      </h5>
                      <div className="space-y-2">
                        {categoryItems.map((item) => (
                          <Card key={item.id} className="p-3">
                            {isEditingItem === item.id ? (
                              <div className="space-y-3">
                                <Input
                                  value={item.title}
                                  onChange={(e) => handleItemEdit(item.id, { title: e.target.value })}
                                  placeholder="Item title"
                                />
                                <Textarea
                                  value={item.description}
                                  onChange={(e) => handleItemEdit(item.id, { description: e.target.value })}
                                  placeholder="Item description"
                                  rows={2}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={item.priority}
                                    onChange={(e) => handleItemEdit(item.id, { priority: parseInt(e.target.value) || 5 })}
                                    placeholder="Priority"
                                  />
                                  <Input
                                    type="number"
                                    min="5"
                                    value={item.estimated_minutes}
                                    onChange={(e) => handleItemEdit(item.id, { estimated_minutes: parseInt(e.target.value) || 30 })}
                                    placeholder="Minutes"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={item.is_mandatory}
                                      onCheckedChange={(checked) => 
                                        handleItemEdit(item.id, { is_mandatory: checked as boolean })
                                      }
                                    />
                                    <span className="text-sm">Mandatory</span>
                                  </div>
                                  <Button size="sm" onClick={() => setIsEditingItem(null)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h6 className="font-medium text-sm">{item.title}</h6>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Badge variant="outline" className="text-xs">
                                      P{item.priority}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setIsEditingItem(item.id)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleRemoveItem(item.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{item.estimated_minutes} min</span>
                                  {item.is_mandatory && (
                                    <Badge variant="destructive" className="text-xs">Required</Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {selectedItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="mx-auto h-8 w-8 mb-2" />
                    <p>No items selected yet</p>
                    <p className="text-xs">Select items from the left panel or add custom items</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={!templateName.trim() || selectedItems.length === 0}
        >
          <Save className="mr-2 h-4 w-4" />
          Create Custom Template
        </Button>
      </div>
    </div>
  );
}