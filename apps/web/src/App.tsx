import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type Employee = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  country: string;
  department: string;
  jobTitle: string;
  salary: number | string;
  currency: string;
  dateOfJoining: string;
};

type EmployeeFormState = {
  employeeCode: string;
  fullName: string;
  email: string;
  country: string;
  department: string;
  jobTitle: string;
  salary: string;
  currency: string;
  dateOfJoining: string;
};

type EmployeeListResponse = {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
};

type CountryInsight = {
  country: string;
  employeeCount: number;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  medianSalary: number;
};

type RoleInsight = {
  country: string;
  jobTitle: string;
  employeeCount: number;
  avgSalary: number;
};

type DepartmentInsight = {
  department: string;
  employeeCount: number;
  avgSalary: number;
  minSalary: number;
  maxSalary: number;
};

type CountryDistribution = {
  country: string;
  employeeCount: number;
  avgSalary: number;
};

type FormErrors = Partial<Record<keyof EmployeeFormState, string>>;

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const countryCurrencyMap = {
  India: "INR",
  "United States": "USD",
  Germany: "EUR",
  "United Kingdom": "GBP",
  Canada: "CAD"
} as const;
const countryOptions = Object.keys(countryCurrencyMap) as Array<keyof typeof countryCurrencyMap>;
const departmentOptions = ["Engineering", "Product", "HR", "Finance", "Operations", "Sales"] as const;
const currencyOptions = ["INR", "USD", "EUR", "GBP", "CAD"] as const;

const emptyFormState = (): EmployeeFormState => ({
  employeeCode: "",
  fullName: "",
  email: "",
  country: "",
  department: "",
  jobTitle: "",
  salary: "",
  currency: "",
  dateOfJoining: new Date().toISOString().slice(0, 10)
});

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0
  }).format(amount);

const toInputDateTime = (value: string) => value.slice(0, 10);
const inferCurrency = (country: string) => countryCurrencyMap[country as keyof typeof countryCurrencyMap] || "USD";

const validateForm = (formState: EmployeeFormState): FormErrors => {
  const errors: FormErrors = {};

  if (!/^EMP-\d{5,}$/.test(formState.employeeCode.trim())) {
    errors.employeeCode = "Use format like EMP-00001.";
  }

  if (formState.fullName.trim().length < 2) {
    errors.fullName = "Enter a valid full name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!formState.country.trim()) {
    errors.country = "Select a country.";
  }

  if (!formState.department.trim()) {
    errors.department = "Select a department.";
  }

  if (formState.jobTitle.trim().length < 2) {
    errors.jobTitle = "Enter a valid job title.";
  }

  if (!(Number(formState.salary) > 0)) {
    errors.salary = "Salary must be greater than zero.";
  }

  if (!formState.currency.trim()) {
    errors.currency = "Select a currency.";
  }

  if (!formState.dateOfJoining.trim()) {
    errors.dateOfJoining = "Select a joining date.";
  }

  return errors;
};

export const App = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [activeCountry, setActiveCountry] = useState("");
  const [activeJobTitle, setActiveJobTitle] = useState("");
  const [countryInsight, setCountryInsight] = useState<CountryInsight | null>(null);
  const [roleInsight, setRoleInsight] = useState<RoleInsight | null>(null);
  const [departmentInsights, setDepartmentInsights] = useState<DepartmentInsight[]>([]);
  const [countryDistribution, setCountryDistribution] = useState<CountryDistribution[]>([]);
  const [formState, setFormState] = useState<EmployeeFormState>(emptyFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const dismissToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = (type: Toast["type"], message: string) => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(() => dismissToast(id), 4000);
  };

  const countries = useMemo(() => Array.from(new Set(employees.map((employee) => employee.country))).sort(), [employees]);
  const jobTitles = useMemo(() => Array.from(new Set(employees.map((employee) => employee.jobTitle))).sort(), [employees]);

  const fetchJson = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json"
      },
      ...init
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error || "Request failed");
    }

    return (await response.json()) as T;
  };

  const loadEmployees = async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search
      });
      const data = await fetchJson<EmployeeListResponse>(`/api/employees?${params.toString()}`);
      setEmployees(data.items);
      setTotal(data.total);
    } catch (requestError) {
      pushToast("error", requestError instanceof Error ? requestError.message : "Unable to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const [departmentData, countryData] = await Promise.all([
        fetchJson<DepartmentInsight[]>("/api/employees/insights/departments"),
        fetchJson<CountryDistribution[]>("/api/employees/insights/countries")
      ]);

      setDepartmentInsights(departmentData);
      setCountryDistribution(countryData);
    } catch (requestError) {
      pushToast("error", requestError instanceof Error ? requestError.message : "Unable to load insights");
    }
  };

  useEffect(() => {
    void loadEmployees();
  }, [page, pageSize, search]);

  useEffect(() => {
    void loadInsights();
  }, []);

  useEffect(() => {
    if (!activeCountry) {
      setCountryInsight(null);
      return;
    }

    void fetchJson<CountryInsight>(`/api/employees/insights/country/${encodeURIComponent(activeCountry)}`)
      .then(setCountryInsight)
      .catch((requestError) =>
        pushToast("error", requestError instanceof Error ? requestError.message : "Unable to load country insight")
      );
  }, [activeCountry]);

  useEffect(() => {
    if (!activeCountry || !activeJobTitle) {
      setRoleInsight(null);
      return;
    }

    const params = new URLSearchParams({
      country: activeCountry,
      jobTitle: activeJobTitle
    });

    void fetchJson<RoleInsight>(`/api/employees/insights/role?${params.toString()}`)
      .then(setRoleInsight)
      .catch((requestError) =>
        pushToast("error", requestError instanceof Error ? requestError.message : "Unable to load role insight")
      );
  }, [activeCountry, activeJobTitle]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormState(emptyFormState());
    setFormErrors({});
    setIsFormVisible(true);
  };

  const openEditForm = (employee: Employee) => {
    setEditingId(employee.id);
    setFormState({
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      email: employee.email,
      country: employee.country,
      department: employee.department,
      jobTitle: employee.jobTitle,
      salary: String(employee.salary),
      currency: employee.currency,
      dateOfJoining: toInputDateTime(employee.dateOfJoining)
    });
    setFormErrors({});
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setEditingId(null);
    setFormState(emptyFormState());
    setFormErrors({});
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(formState);

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    setIsSaving(true);

    const payload = {
      ...formState,
      salary: Number(formState.salary),
      dateOfJoining: new Date(formState.dateOfJoining).toISOString()
    };

    try {
      if (editingId) {
        await fetchJson<Employee>(`/api/employees/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await fetchJson<Employee>("/api/employees", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      const wasEditing = Boolean(editingId);
      closeForm();
      await Promise.all([loadEmployees(), loadInsights()]);
      pushToast("success", wasEditing ? "Employee updated successfully." : "Employee created successfully.");
    } catch (requestError) {
      pushToast("error", requestError instanceof Error ? requestError.message : "Unable to save employee");
    } finally {
      setIsSaving(false);
    }
  };

  const requestDelete = (employee: Employee) => {
    setPendingDelete(employee);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await fetch(`${API_BASE_URL}/api/employees/${pendingDelete.id}`, { method: "DELETE" });
      await Promise.all([loadEmployees(), loadInsights()]);
      pushToast("success", `${pendingDelete.fullName} was deleted.`);
      setPendingDelete(null);
    } catch (requestError) {
      pushToast("error", requestError instanceof Error ? requestError.message : "Unable to delete employee");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon" aria-hidden="true">
              {toast.type === "success" ? "✓" : "!"}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <section className="hero">
        <div>
          <p className="eyebrow">HR Operations</p>
          <h1>Salary Management Platform</h1>
          <p className="subtitle">Manage employee compensation records and answer salary questions without spreadsheets.</p>
        </div>
        <button className="primary-button" onClick={openCreateForm}>
          Add employee
        </button>
      </section>

      <section className="card-grid">
        <article className="metric-card">
          <span className="metric-label">Total Employees</span>
          <strong className="metric-value">{total}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Countries Covered</span>
          <strong className="metric-value">{countryDistribution.length}</strong>
        </article>
        <article className="metric-card">
          <span className="metric-label">Largest Workforce</span>
          <strong className="metric-value metric-value-wrap">{countryDistribution[0]?.country || "N/A"}</strong>
        </article>
      </section>

      <section className="content-stack">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Employee Directory</h2>
              <p>Search and maintain salary records across the organization.</p>
            </div>
            <input
              className="search-input"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search by code, name, email, country, department, title"
            />
          </div>

          <div className="table-wrapper">
            <table>
              <colgroup>
                <col className="col-code" />
                <col className="col-name" />
                <col className="col-email" />
                <col className="col-role" />
                <col className="col-country" />
                <col className="col-department" />
                <col className="col-salary" />
                <col className="col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Country</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      Loading employees...
                    </td>
                  </tr>
                ) : null}
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employeeCode}</td>
                    <td className="cell-name">
                      <strong>{employee.fullName}</strong>
                    </td>
                    <td className="cell-email">{employee.email}</td>
                    <td className="cell-role">{employee.jobTitle}</td>
                    <td>{employee.country}</td>
                    <td>{employee.department}</td>
                    <td className="cell-salary">
                      <strong>{formatMoney(Number(employee.salary), employee.currency)}</strong>
                      <span className="salary-currency">{employee.currency}</span>
                    </td>
                    <td className="table-actions">
                      <button className="ghost-button" onClick={() => openEditForm(employee)}>
                        Edit
                      </button>
                      <button className="danger-button" onClick={() => requestDelete(employee)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!employees.length && !isLoading ? (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No employees found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="pagination-row">
            <span>{isLoading ? "Loading..." : `Showing ${employees.length} of ${total} employees`}</span>
            <div className="pagination-actions">
              <button className="ghost-button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                Previous
              </button>
              <span className="page-indicator">Page {page}</span>
              <button className="ghost-button" disabled={page * pageSize >= total} onClick={() => setPage((current) => current + 1)}>
                Next
              </button>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Salary Insights</h2>
              <p>Explore pay trends by country, role, and department.</p>
            </div>
          </div>

          <div className="filter-grid">
            <select value={activeCountry} onChange={(event) => setActiveCountry(event.target.value)}>
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <select value={activeJobTitle} onChange={(event) => setActiveJobTitle(event.target.value)}>
              <option value="">Select role</option>
              {jobTitles.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div className="insight-grid">
            {countryInsight ? (
              <div className="insight-block">
                <h3>{countryInsight.country}</h3>
                <p>Employees: {countryInsight.employeeCount}</p>
                <p>Average salary: {formatMoney(countryInsight.avgSalary, inferCurrency(countryInsight.country))}</p>
                <p>Median salary: {formatMoney(countryInsight.medianSalary, inferCurrency(countryInsight.country))}</p>
                <p>
                  Range: {formatMoney(countryInsight.minSalary, inferCurrency(countryInsight.country))} -{" "}
                  {formatMoney(countryInsight.maxSalary, inferCurrency(countryInsight.country))}
                </p>
              </div>
            ) : (
              <div className="insight-block insight-placeholder">
                <h3>Country Summary</h3>
                <p>Select a country to see salary distribution.</p>
              </div>
            )}

            {roleInsight ? (
              <div className="insight-block">
                <h3>{roleInsight.jobTitle}</h3>
                <p>Country: {roleInsight.country}</p>
                <p>Employees: {roleInsight.employeeCount}</p>
                <p>Average salary: {formatMoney(roleInsight.avgSalary, inferCurrency(roleInsight.country))}</p>
              </div>
            ) : (
              <div className="insight-block insight-placeholder">
                <h3>Role Summary</h3>
                <p>Select both country and role to compare compensation.</p>
              </div>
            )}

            <div className="insight-block">
              <h3>Department Overview</h3>
              <div className="insight-list compact-list">
                {departmentInsights.slice(0, 6).map((department) => (
                  <div className="list-row" key={department.department}>
                    <span>{department.department}</span>
                    <span>{formatMoney(department.avgSalary, "USD")} avg</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="insight-block">
              <h3>Country Distribution</h3>
              <div className="insight-list compact-list">
                {countryDistribution.slice(0, 5).map((country) => (
                  <div className="list-row" key={country.country}>
                    <span>{country.country}</span>
                    <span>{country.employeeCount} employees</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      {isFormVisible ? (
        <section className="modal-backdrop">
          <div className="modal">
            <div className="panel-header">
              <div>
                <h2>{editingId ? "Edit employee" : "Add employee"}</h2>
                <p>Capture clean salary data with required validation.</p>
              </div>
              <button className="ghost-button" onClick={closeForm}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={onSubmit}>
              {Object.entries(formState).map(([key, value]) => (
                <label key={key}>
                  <span>
                    {key === "employeeCode"
                      ? "Employee Code"
                      : key === "fullName"
                        ? "Full Name"
                        : key === "email"
                          ? "Email"
                          : key === "country"
                            ? "Country"
                            : key === "department"
                              ? "Department"
                              : key === "jobTitle"
                                ? "Job Title"
                                : key === "salary"
                                  ? "Salary"
                                  : key === "currency"
                                    ? "Currency"
                                    : "Date of Joining"}
                  </span>
                  {key === "country" ? (
                    <select
                      value={value}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          country: event.target.value,
                          currency: countryCurrencyMap[event.target.value as keyof typeof countryCurrencyMap] || current.currency
                        }))
                      }
                    >
                      <option value="">Select country</option>
                      {countryOptions.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  ) : key === "department" ? (
                    <select value={value} onChange={(event) => setFormState((current) => ({ ...current, department: event.target.value }))}>
                      <option value="">Select department</option>
                      {departmentOptions.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  ) : key === "currency" ? (
                    <select value={value} onChange={(event) => setFormState((current) => ({ ...current, currency: event.target.value }))}>
                      <option value="">Select currency</option>
                      {currencyOptions.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={key === "salary" ? "number" : key === "dateOfJoining" ? "date" : "text"}
                      value={value}
                      placeholder={
                        key === "employeeCode"
                          ? "EMP-00001"
                          : key === "fullName"
                            ? "Enter employee name"
                            : key === "email"
                              ? "name@acme.test"
                              : key === "jobTitle"
                                ? "Enter job title"
                                : key === "salary"
                                  ? "Enter salary"
                                  : ""
                      }
                      onChange={(event) => setFormState((current) => ({ ...current, [key]: event.target.value }))}
                      required
                    />
                  )}
                  {formErrors[key as keyof EmployeeFormState] ? (
                    <span className="field-error">{formErrors[key as keyof EmployeeFormState]}</span>
                  ) : null}
                </label>
              ))}
              <div className="form-actions">
                <button type="button" className="ghost-button" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={isSaving}>
                  {isSaving ? "Saving..." : editingId ? "Update employee" : "Create employee"}
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      {pendingDelete ? (
        <section className="modal-backdrop">
          <div className="modal confirm-modal">
            <h2>Delete employee?</h2>
            <p>
              This will permanently remove <strong>{pendingDelete.fullName}</strong> ({pendingDelete.employeeCode}) from
              your records. This action cannot be undone.
            </p>
            <div className="form-actions">
              <button type="button" className="ghost-button" onClick={cancelDelete} disabled={isDeleting}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={() => void confirmDelete()} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete employee"}
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
};
