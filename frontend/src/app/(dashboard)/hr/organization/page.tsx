'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  OrganizationTree,
  DepartmentHierarchyView,
} from '@/components/hr/organization';

export default function OrganizationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Struktur Organisasi</h1>
        <p className="text-muted-foreground">
          Visualisasi hierarki organisasi perusahaan
        </p>
      </div>

      <Tabs defaultValue="tree" className="w-full">
        <TabsList>
          <TabsTrigger value="tree">Struktur Organisasi</TabsTrigger>
          <TabsTrigger value="departments">Hierarki Departemen</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pohon Organisasi</CardTitle>
              <CardDescription>
                Struktur hierarki karyawan berdasarkan atasan langsung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationTree />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hierarki Departemen</CardTitle>
              <CardDescription>
                Struktur departemen berdasarkan divisi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentHierarchyView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}