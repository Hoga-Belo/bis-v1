'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PermissionGroup } from '@/lib/api/endpoints/roles';

interface PermissionTreeProps {
  permissionGroups: PermissionGroup[];
  selectedPermissionIds: string[];
  onSelectionChange: (permissionIds: string[]) => void;
  disabled?: boolean;
}

const MODULE_NAMES: Record<string, string> = {
  hr: 'Human Resources',
  inventory: 'Inventory',
  mess: 'Mess Management',
  building: 'Building Management',
  user: 'User Access',
};

const FEATURE_NAMES: Record<string, string> = {
  employee: 'Karyawan',
  attendance: 'Kehadiran',
  leave: 'Cuti',
  department: 'Departemen',
  division: 'Divisi',
  position: 'Jabatan',
  product: 'Produk',
  stock: 'Stok',
  asset: 'Aset',
  warehouse: 'Gudang',
  category: 'Kategori',
  brand: 'Merek',
  site: 'Site',
  block: 'Blok',
  floor: 'Lantai',
  room: 'Kamar',
  occupancy: 'Penghuni',
  maintenance: 'Maintenance',
  user: 'User',
  role: 'Role',
  permission: 'Permission',
};

const ACTION_NAMES: Record<string, string> = {
  create: 'Tambah',
  read: 'Lihat',
  update: 'Edit',
  delete: 'Hapus',
};

interface FeaturePermissions {
  feature: string;
  permissions: {
    id: string;
    code: string;
    name: string;
    action: string;
    description: string;
  }[];
}

interface ModuleWithFeatures {
  module: string;
  features: FeaturePermissions[];
}

export function PermissionTree({
  permissionGroups,
  selectedPermissionIds,
  onSelectionChange,
  disabled = false,
}: PermissionTreeProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(permissionGroups.map((g) => g.module))
  );
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(
    new Set()
  );

  const modulesWithFeatures = useMemo<ModuleWithFeatures[]>(() => {
    return permissionGroups.map((group) => {
      const featureMap = new Map<string, FeaturePermissions>();

      group.permissions.forEach((permission) => {
        const parts = permission.code.split('.');
        const feature = parts.length >= 2 ? parts[1] : 'general';

        if (!featureMap.has(feature)) {
          featureMap.set(feature, { feature, permissions: [] });
        }

        featureMap.get(feature)!.permissions.push(permission);
      });

      return {
        module: group.module,
        features: Array.from(featureMap.values()).sort((a, b) =>
          a.feature.localeCompare(b.feature)
        ),
      };
    });
  }, [permissionGroups]);

  const toggleModule = useCallback((module: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  }, []);

  const toggleFeature = useCallback((featureKey: string) => {
    setExpandedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(featureKey)) {
        next.delete(featureKey);
      } else {
        next.add(featureKey);
      }
      return next;
    });
  }, []);

  const getModulePermissionIds = useCallback(
    (module: string): string[] => {
      const group = permissionGroups.find((g) => g.module === module);
      return group ? group.permissions.map((p) => p.id) : [];
    },
    [permissionGroups]
  );

  const getFeaturePermissionIds = useCallback(
    (module: string, feature: string): string[] => {
      const moduleData = modulesWithFeatures.find((m) => m.module === module);
      const featureData = moduleData?.features.find((f) => f.feature === feature);
      return featureData ? featureData.permissions.map((p) => p.id) : [];
    },
    [modulesWithFeatures]
  );

  const isModuleFullySelected = useCallback(
    (module: string): boolean => {
      const ids = getModulePermissionIds(module);
      return ids.length > 0 && ids.every((id) => selectedPermissionIds.includes(id));
    },
    [getModulePermissionIds, selectedPermissionIds]
  );

  const isModulePartiallySelected = useCallback(
    (module: string): boolean => {
      const ids = getModulePermissionIds(module);
      const selectedCount = ids.filter((id) => selectedPermissionIds.includes(id)).length;
      return selectedCount > 0 && selectedCount < ids.length;
    },
    [getModulePermissionIds, selectedPermissionIds]
  );

  const isFeatureFullySelected = useCallback(
    (module: string, feature: string): boolean => {
      const ids = getFeaturePermissionIds(module, feature);
      return ids.length > 0 && ids.every((id) => selectedPermissionIds.includes(id));
    },
    [getFeaturePermissionIds, selectedPermissionIds]
  );

  const isFeaturePartiallySelected = useCallback(
    (module: string, feature: string): boolean => {
      const ids = getFeaturePermissionIds(module, feature);
      const selectedCount = ids.filter((id) => selectedPermissionIds.includes(id)).length;
      return selectedCount > 0 && selectedCount < ids.length;
    },
    [getFeaturePermissionIds, selectedPermissionIds]
  );

  const handleModuleToggle = useCallback(
    (module: string) => {
      const ids = getModulePermissionIds(module);
      const isFullySelected = isModuleFullySelected(module);

      if (isFullySelected) {
        onSelectionChange(selectedPermissionIds.filter((id) => !ids.includes(id)));
      } else {
        const newSelection = new Set([...selectedPermissionIds, ...ids]);
        onSelectionChange(Array.from(newSelection));
      }
    },
    [getModulePermissionIds, isModuleFullySelected, onSelectionChange, selectedPermissionIds]
  );

  const handleFeatureToggle = useCallback(
    (module: string, feature: string) => {
      const ids = getFeaturePermissionIds(module, feature);
      const isFullySelected = isFeatureFullySelected(module, feature);

      if (isFullySelected) {
        onSelectionChange(selectedPermissionIds.filter((id) => !ids.includes(id)));
      } else {
        const newSelection = new Set([...selectedPermissionIds, ...ids]);
        onSelectionChange(Array.from(newSelection));
      }
    },
    [getFeaturePermissionIds, isFeatureFullySelected, onSelectionChange, selectedPermissionIds]
  );

  const handlePermissionToggle = useCallback(
    (permissionId: string) => {
      if (selectedPermissionIds.includes(permissionId)) {
        onSelectionChange(selectedPermissionIds.filter((id) => id !== permissionId));
      } else {
        onSelectionChange([...selectedPermissionIds, permissionId]);
      }
    },
    [onSelectionChange, selectedPermissionIds]
  );

  const handleSelectAll = useCallback(() => {
    const allIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));
    onSelectionChange(allIds);
  }, [onSelectionChange, permissionGroups]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleSelectAll} disabled={disabled}>
          Pilih Semua
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll} disabled={disabled}>
          Hapus Semua
        </Button>
      </div>

      <div className="rounded-md border">
        {modulesWithFeatures.map((moduleData) => {
          const isModuleExpanded = expandedModules.has(moduleData.module);
          const moduleFullySelected = isModuleFullySelected(moduleData.module);
          const modulePartiallySelected = isModulePartiallySelected(moduleData.module);

          return (
            <div key={moduleData.module} className="border-b last:border-b-0">
              <div className={cn('flex items-center gap-2 px-4 py-3 hover:bg-muted/50', disabled && 'opacity-50')}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleModule(moduleData.module)}
                  disabled={disabled}
                >
                  {isModuleExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                <div
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                  onClick={() => !disabled && handleModuleToggle(moduleData.module)}
                >
                  <div className="relative flex items-center justify-center">
                    <Checkbox
                      checked={moduleFullySelected}
                      disabled={disabled}
                      onCheckedChange={() => handleModuleToggle(moduleData.module)}
                    />
                    {modulePartiallySelected && !moduleFullySelected && (
                      <Minus className="absolute h-3 w-3 text-primary" />
                    )}
                  </div>
                  <span className="font-medium">{MODULE_NAMES[moduleData.module] || moduleData.module}</span>
                </div>
              </div>

              {isModuleExpanded && (
                <div className="bg-muted/30">
                  {moduleData.features.map((featureData) => {
                    const featureKey = `${moduleData.module}.${featureData.feature}`;
                    const isFeatureExpanded = expandedFeatures.has(featureKey);
                    const featureFullySelected = isFeatureFullySelected(moduleData.module, featureData.feature);
                    const featurePartiallySelected = isFeaturePartiallySelected(moduleData.module, featureData.feature);

                    return (
                      <div key={featureKey}>
                        <div
                          className={cn(
                            'flex items-center gap-2 px-4 py-2 pl-10 hover:bg-muted/50',
                            disabled && 'opacity-50'
                          )}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => toggleFeature(featureKey)}
                            disabled={disabled}
                          >
                            {isFeatureExpanded ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                          <div
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => !disabled && handleFeatureToggle(moduleData.module, featureData.feature)}
                          >
                            <div className="relative flex items-center justify-center">
                              <Checkbox
                                checked={featureFullySelected}
                                disabled={disabled}
                                onCheckedChange={() => handleFeatureToggle(moduleData.module, featureData.feature)}
                              />
                              {featurePartiallySelected && !featureFullySelected && (
                                <Minus className="absolute h-3 w-3 text-primary" />
                              )}
                            </div>
                            <span className="text-sm">{FEATURE_NAMES[featureData.feature] || featureData.feature}</span>
                          </div>
                        </div>

                        {isFeatureExpanded && (
                          <div className="pl-16 pb-2">
                            {featureData.permissions.map((permission) => {
                              const isSelected = selectedPermissionIds.includes(permission.id);
                              const actionParts = permission.code.split('.');
                              const action = actionParts[actionParts.length - 1];

                              return (
                                <div
                                  key={permission.id}
                                  className={cn(
                                    'flex items-center gap-2 px-4 py-1.5 hover:bg-muted/50 rounded-sm cursor-pointer',
                                    disabled && 'opacity-50 cursor-not-allowed'
                                  )}
                                  onClick={() => !disabled && handlePermissionToggle(permission.id)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    disabled={disabled}
                                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                                  />
                                  <span className="text-sm">{ACTION_NAMES[action] || action}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}