
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Employee } from '../../../entities/hr/employee.entity';
import { Department } from '../../../entities/hr/department.entity';
import { Division } from '../../../entities/hr/division.entity';

/**
 * Type for manager lookup function used in circular dependency validation
 */
export type ManagerLookupFn = (
  id: string,
) => Promise<{ managerId: string | null } | null>;

/**
 * Interface for organization tree node
 */
export interface OrganizationNode {
  id: string;
  nik: string;
  name: string;
  position: {
    id: string;
    name: string;
    level: number;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  division: {
    id: string;
    name: string;
  } | null;
  photoUrl: string | null;
  childrenCount: number;
  children: OrganizationNode[];
}

/**
 * Interface for department hierarchy grouped by division
 */
export interface DepartmentHierarchy {
  division: {
    id: string;
    code: string;
    name: string;
  };
  departments: {
    id: string;
    code: string;
    name: string;
    manager: {
      id: string;
      nik: string;
      name: string;
    } | null;
    employeeCount: number;
  }[];
}

/**
 * Interface for direct report employee
 */
export interface DirectReportEmployee {
  id: string;
  nik: string;
  name: string;
  position: {
    id: string;
    name: string;
    level: number;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  photoUrl: string | null;
}

/**
 * Interface for employee summary (for dropdowns)
 */
export interface EmployeeSummaryDto {
  id: string;
  nik: string;
  fullName: string;
  nickname: string | null;
  photoUrl: string | null;
}

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Division)
    private divisionRepository: Repository<Division>,
  ) {}

  /**
   * Build full organization tree starting from root nodes (employees with no manager)
   * Uses visited set to prevent infinite recursion from circular dependencies
   */
  async getOrganizationTree(): Promise<OrganizationNode[]> {
    // Query all active employees with relations
    const employees = await this.employeeRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['position', 'department', 'division', 'manager'],
      order: { fullName: 'ASC' },
    });

    // Find root nodes (no manager)
    const rootEmployees = employees.filter((emp) => !emp.managerId);

    // Sort root employees by position level (lower level = higher in hierarchy)
    rootEmployees.sort((a, b) => {
      const levelA = a.position?.level ?? 999;
      const levelB = b.position?.level ?? 999;
      return levelA - levelB;
    });

    // Recursively build tree with visited set to prevent infinite recursion
    const buildNode = (
      employee: Employee,
      visited: Set<string> = new Set(),
    ): OrganizationNode => {
      // Skip if already visited (circular dependency detected)
      if (visited.has(employee.id)) {
        return {
          id: employee.id,
          nik: employee.nik,
          name: employee.fullName,
          position: employee.position
            ? {
                id: employee.position.id,
                name: employee.position.name,
                level: employee.position.level,
              }
            : null,
          department: employee.department
            ? {
                id: employee.department.id,
                name: employee.department.name,
              }
            : null,
          division: employee.division
            ? {
                id: employee.division.id,
                name: employee.division.name,
              }
            : null,
          photoUrl: employee.photoUrl || null,
          childrenCount: 0,
          children: [], // Stop recursion for circular reference
        };
      }

      // Mark as visited
      visited.add(employee.id);

      const children = employees.filter(
        (emp) => emp.managerId === employee.id && !visited.has(emp.id),
      );
      // Sort children by position level
      children.sort((a, b) => {
        const levelA = a.position?.level ?? 999;
        const levelB = b.position?.level ?? 999;
        return levelA - levelB;
      });

      return {
        id: employee.id,
        nik: employee.nik,
        name: employee.fullName,
        position: employee.position
          ? {
              id: employee.position.id,
              name: employee.position.name,
              level: employee.position.level,
            }
          : null,
        department: employee.department
          ? {
              id: employee.department.id,
              name: employee.department.name,
            }
          : null,
        division: employee.division
          ? {
              id: employee.division.id,
              name: employee.division.name,
            }
          : null,
        photoUrl: employee.photoUrl || null,
        childrenCount: children.length,
        children: children.map((child) => buildNode(child, new Set(visited))),
      };
    };

    return rootEmployees.map((emp) => buildNode(emp, new Set()));
  }

  /**
   * Get subtree starting from a specific employee
   * Uses visited set to prevent infinite recursion from circular dependencies
   */
  async getEmployeeSubtree(
    employeeId: string,
  ): Promise<OrganizationNode | null> {
    const employees = await this.employeeRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['position', 'department', 'division', 'manager'],
    });

    const rootEmployee = employees.find((emp) => emp.id === employeeId);
    if (!rootEmployee) return null;

    const buildNode = (
      employee: Employee,
      visited: Set<string> = new Set(),
    ): OrganizationNode => {
      // Skip if already visited (circular dependency detected)
      if (visited.has(employee.id)) {
        return {
          id: employee.id,
          nik: employee.nik,
          name: employee.fullName,
          position: employee.position
            ? {
                id: employee.position.id,
                name: employee.position.name,
                level: employee.position.level,
              }
            : null,
          department: employee.department
            ? {
                id: employee.department.id,
                name: employee.department.name,
              }
            : null,
          division: employee.division
            ? {
                id: employee.division.id,
                name: employee.division.name,
              }
            : null,
          photoUrl: employee.photoUrl || null,
          childrenCount: 0,
          children: [], // Stop recursion for circular reference
        };
      }

      // Mark as visited
      visited.add(employee.id);

      const children = employees.filter(
        (emp) => emp.managerId === employee.id && !visited.has(emp.id),
      );
      // Sort children by position level
      children.sort((a, b) => {
        const levelA = a.position?.level ?? 999;
        const levelB = b.position?.level ?? 999;
        return levelA - levelB;
      });

      return {
        id: employee.id,
        nik: employee.nik,
        name: employee.fullName,
        position: employee.position
          ? {
              id: employee.position.id,
              name: employee.position.name,
              level: employee.position.level,
            }
          : null,
        department: employee.department
          ? {
              id: employee.department.id,
              name: employee.department.name,
            }
          : null,
        division: employee.division
          ? {
              id: employee.division.id,
              name: employee.division.name,
            }
          : null,
        photoUrl: employee.photoUrl || null,
        childrenCount: children.length,
        children: children.map((child) => buildNode(child, new Set(visited))),
      };
    };

    return buildNode(rootEmployee, new Set());
  }

  /**
   * Get direct reports for an employee
   */
  async getDirectReports(employeeId: string): Promise<DirectReportEmployee[]> {
    const employees = await this.employeeRepository.find({
      where: { managerId: employeeId, deletedAt: IsNull() },
      relations: ['position', 'department'],
      order: { fullName: 'ASC' },
    });

    return employees.map((emp) => ({
      id: emp.id,
      nik: emp.nik,
      name: emp.fullName,
      position: emp.position
        ? {
            id: emp.position.id,
            name: emp.position.name,
            level: emp.position.level,
          }
        : null,
      department: emp.department
        ? {
            id: emp.department.id,
            name: emp.department.name,
          }
        : null,
      photoUrl: emp.photoUrl || null,
    }));
  }

  /**
   * Get all subordinates (direct and indirect) for an employee
   * Uses visited set to prevent infinite recursion from circular dependencies
   */
  async getAllSubordinates(
    employeeId: string,
  ): Promise<DirectReportEmployee[]> {
    const employees = await this.employeeRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['position', 'department'],
    });

    const subordinates: Employee[] = [];
    const visited = new Set<string>();

    const collectSubordinates = (managerId: string) => {
      // Skip if already visited (circular dependency detected)
      if (visited.has(managerId)) {
        return;
      }
      visited.add(managerId);

      const directReports = employees.filter(
        (emp) => emp.managerId === managerId && !visited.has(emp.id),
      );
      directReports.forEach((emp) => {
        subordinates.push(emp);
        collectSubordinates(emp.id);
      });
    };

    collectSubordinates(employeeId);

    // Sort by name
    subordinates.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return subordinates.map((emp) => ({
      id: emp.id,
      nik: emp.nik,
      name: emp.fullName,
      position: emp.position
        ? {
            id: emp.position.id,
            name: emp.position.name,
            level: emp.position.level,
          }
        : null,
      department: emp.department
        ? {
            id: emp.department.id,
            name: emp.department.name,
          }
        : null,
      photoUrl: emp.photoUrl || null,
    }));
  }

  /**
   * Get department hierarchy grouped by division
   */
  async getDepartmentHierarchy(): Promise<DepartmentHierarchy[]> {
    const divisions = await this.divisionRepository.find({
      where: { deletedAt: IsNull() },
      order: { name: 'ASC' },
    });

    const departments = await this.departmentRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['division', 'manager', 'employees'],
    });

    return divisions.map((division) => ({
      division: {
        id: division.id,
        code: division.code,
        name: division.name,
      },
      departments: departments
        .filter((dept) => dept.divisionId === division.id)
        .map((dept) => ({
          id: dept.id,
          code: dept.code,
          name: dept.name,
          manager: dept.manager
            ? {
                id: dept.manager.id,
                nik: dept.manager.nik,
                name: dept.manager.fullName,
              }
            : null,
          employeeCount: dept.employees?.filter((e) => !e.deletedAt).length || 0,
        })),
    }));
  }

  /**
   * Get all active employees as a flat list (for dropdowns)
   */
  async getAllEmployees(): Promise<EmployeeSummaryDto[]> {
    const employees = await this.employeeRepository.find({
      where: { deletedAt: IsNull() },
      order: { fullName: 'ASC' },
      select: ['id', 'nik', 'fullName', 'nickname', 'photoUrl'],
    });

    return employees.map((emp) => ({
      id: emp.id,
      nik: emp.nik,
      fullName: emp.fullName,
      nickname: emp.nickname ?? null,
      photoUrl: emp.photoUrl ?? null,
    }));
  }

  /**
   * Validate that setting a manager relationship would not create a circular dependency.
   * This method traverses upward from the proposed manager to ensure it never reaches
   * the entity being updated.
   *
   * @param entityId - The ID of the entity being updated (employee or department)
   * @param proposedManagerId - The ID of the proposed manager
   * @param getManager - A function that retrieves the manager ID for a given entity
   * @throws BadRequestException if setting the manager would create a circular dependency
   *
   * @example
   * // For employees:
   * await organizationService.validateNoCircularDependency(
   *   employeeId,
   *   proposedManagerId,
   *   async (id) => {
   *     const emp = await employeeRepository.findOne({ where: { id } });
   *     return emp ? { managerId: emp.managerId } : null;
   *   }
   * );
   *
   * // For departments:
   * await organizationService.validateNoCircularDependency(
   *   departmentId,
   *   proposedParentId,
   *   async (id) => {
   *     const dept = await departmentRepository.findOne({ where: { id } });
   *     return dept ? { managerId: dept.parentDepartmentId } : null;
   *   }
   * );
   */
  async validateNoCircularDependency(
    entityId: string,
    proposedManagerId: string | null,
    getManager: ManagerLookupFn,
  ): Promise<void> {
    // If no manager is being set, no circular dependency is possible
    if (!proposedManagerId) {
      return;
    }

    // Cannot set self as manager
    if (entityId === proposedManagerId) {
      throw new BadRequestException(
        'Cannot set manager: entity cannot be its own manager',
      );
    }

    const visited = new Set<string>();
    let currentId: string | null = proposedManagerId;

    while (currentId) {
      // If we reach the entity being updated, we have a circular dependency
      if (currentId === entityId) {
        throw new BadRequestException(
          'Cannot set manager: would create circular dependency',
        );
      }

      // If we've already visited this node, we've detected a pre-existing cycle
      // (shouldn't happen in normal operation, but prevents infinite loop)
      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);

      const entity = await getManager(currentId);
      currentId = entity?.managerId ?? null;
    }
  }

  /**
   * Validate that setting an employee's manager would not create a circular dependency.
   * Convenience method that uses the employee repository internally.
   *
   * @param employeeId - The ID of the employee being updated
   * @param proposedManagerId - The ID of the proposed manager
   * @throws BadRequestException if setting the manager would create a circular dependency
   */
  async validateEmployeeManagerNoCircularDependency(
    employeeId: string,
    proposedManagerId: string | null,
  ): Promise<void> {
    await this.validateNoCircularDependency(
      employeeId,
      proposedManagerId,
      async (id: string) => {
        const emp = await this.employeeRepository.findOne({
          where: { id, deletedAt: IsNull() },
          select: ['id', 'managerId'],
        });
        return emp ? { managerId: emp.managerId ?? null } : null;
      },
    );
  }
}