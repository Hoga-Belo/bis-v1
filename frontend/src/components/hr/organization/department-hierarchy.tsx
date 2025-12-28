'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { organizationApi } from '@/lib/api/endpoints/hr';
import type { DepartmentHierarchy } from '@/lib/types/hr';

interface DivisionCardProps {
  hierarchy: DepartmentHierarchy;
}

function DivisionCard({ hierarchy }: DivisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const totalEmployees = hierarchy.departments.reduce(
    (sum, dept) => sum + (dept.employeeCount || 0),
    0
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 bg-muted/30 cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        <Building2 className="h-5 w-5 text-primary" />

        <div className="flex-1">
          <div className="font-semibold">{hierarchy.division.name}</div>
          <div className="text-sm text-muted-foreground">
            {hierarchy.division.code}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {hierarchy.departments.length} Departemen
          </Badge>
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {totalEmployees} Karyawan
          </Badge>
        </div>
      </div>

      {isExpanded && hierarchy.departments.length > 0 && (
        <div className="divide-y">
          {hierarchy.departments.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center gap-3 p-4 pl-14 hover:bg-muted/20"
            >
              <div className="flex-1">
                <div className="font-medium">{dept.name}</div>
                <div className="text-sm text-muted-foreground">
                  {dept.code}
                  {dept.manager && ` • Manager: ${dept.manager.name}`}
                </div>
              </div>

              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {dept.employeeCount || 0}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {isExpanded && hierarchy.departments.length === 0 && (
        <div className="p-4 pl-14 text-sm text-muted-foreground">
          Belum ada departemen dalam divisi ini
        </div>
      )}
    </div>
  );
}

export function DepartmentHierarchyView() {
  const [hierarchyData, setHierarchyData] = useState<DepartmentHierarchy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const response = await organizationApi.getDepartmentHierarchy();
        setHierarchyData(response.data ?? []);
      } catch (error) {
        toast.error('Gagal memuat hierarki departemen');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (hierarchyData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Belum ada data hierarki departemen</p>
        <p className="text-sm">
          Tambahkan divisi dan departemen untuk membangun hierarki
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hierarchyData.map((hierarchy) => (
        <DivisionCard key={hierarchy.division.id} hierarchy={hierarchy} />
      ))}
    </div>
  );
}