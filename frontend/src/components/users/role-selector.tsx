'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { rolesApi, Role } from '@/lib/api/endpoints/roles';
import { usersApi } from '@/lib/api/endpoints/users';
import { UserRole } from '@/lib/types/user';
import { Loader2, Save } from 'lucide-react';

interface RoleSelectorProps {
  userId: string;
  currentRoles: UserRole[];
  onSuccess?: () => void;
  disabled?: boolean;
}

export function RoleSelector({
  userId,
  currentRoles,
  onSuccess,
  disabled = false,
}: RoleSelectorProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize selected roles from current roles
  useEffect(() => {
    setSelectedRoleIds(currentRoles.map((role) => role.id));
  }, [currentRoles]);

  // Fetch all available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await rolesApi.getRoles();
        if (response.success && response.data) {
          setRoles(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        toast.error('Gagal memuat daftar role');
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  // Check if there are changes
  useEffect(() => {
    const currentRoleIds = currentRoles.map((role) => role.id).sort();
    const selectedSorted = [...selectedRoleIds].sort();

    const changed =
      currentRoleIds.length !== selectedSorted.length ||
      currentRoleIds.some((id, index) => id !== selectedSorted[index]);

    setHasChanges(changed);
  }, [selectedRoleIds, currentRoles]);

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoleIds((prev) => [...prev, roleId]);
    } else {
      setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
    }
  };

  const handleSave = async () => {
    if (selectedRoleIds.length === 0) {
      toast.error('Pilih minimal satu role');
      return;
    }

    setIsSaving(true);
    try {
      const response = await usersApi.assignRoles(userId, {
        roleIds: selectedRoleIds,
      });

      if (response.success) {
        toast.success('Role berhasil diperbarui');
        onSuccess?.();
      } else {
        toast.error(response.message || 'Gagal memperbarui role');
      }
    } catch (error) {
      console.error('Failed to assign roles:', error);
      toast.error('Terjadi kesalahan saat memperbarui role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedRoleIds(currentRoles.map((role) => role.id));
  };

  if (isLoadingRoles) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {roles.map((role) => {
          const isSelected = selectedRoleIds.includes(role.id);
          const isSystemRole = role.isSystem;

          return (
            <div
              key={role.id}
              className={`flex items-start space-x-3 rounded-lg border p-3 transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/50'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              <Checkbox
                id={`role-${role.id}`}
                checked={isSelected}
                onCheckedChange={(checked: boolean | 'indeterminate') =>
                  handleRoleToggle(role.id, checked === true)
                }
                disabled={disabled}
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor={`role-${role.id}`}
                  className={`block cursor-pointer text-sm font-medium leading-none ${
                    disabled ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {role.name}
                  {isSystemRole && (
                    <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      System
                    </span>
                  )}
                </label>
                {role.description && (
                  <p className="text-xs text-muted-foreground">
                    {role.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {role.userCount} user
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {!disabled && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {selectedRoleIds.length} role dipilih
          </p>
          <div className="flex gap-2">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges || selectedRoleIds.length === 0}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}