import React from 'react'
//////////////////////아키텍처 START
const RequirementsDefinition = React.lazy(
  () => import('./views/requirements/RequirementsDefinition'),
)
const RequirementsTracking = React.lazy(() => import('./views/requirements/RequirementsTracking'))
//////////////////////아기텍처 종료
//////////////////////시스템관리 START
const UserManagement = React.lazy(() => import('./views/system/UserManagement'))
const CodeManagement = React.lazy(() => import('./views/system/CodeManagement'))
//////////////////////시스템관리 종료
const CompanyList = React.lazy(() => import('./views/company/CompanyList'))
const CompanyForm = React.lazy(() => import('./views/company/CompanyForm'))
//////////////////////coreUI START
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))
// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))
// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))
//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))
const Charts = React.lazy(() => import('./views/charts/Charts'))
// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))
// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))
//////////////////////coreUI END
const routes = [
  {
    path: '/requirements/definition',
    name: '요구사항정의',
    element: <RequirementsDefinition />,
    private: true,
  },
  {
    path: '/requirements/tracking',
    name: '요구사항추적',
    element: <RequirementsTracking />,
    private: true,
  },
  { path: '/system/company', name: '회사목록', element: <CompanyList />, private: true },
  { path: '/system/company/new', name: '회사등록', element: <CompanyForm />, private: true },
  { path: '/system/company/:id', name: '회사수정', element: <CompanyForm />, private: true },
  { path: '/system/user', name: '사용자관리', element: <UserManagement />, private: true },
  { path: '/system/code', name: '공통코드관리', element: <CodeManagement />, private: true },
  { path: '/', exact: true, name: 'Home', element: <Dashboard />, private: true },
  { path: '/dashboard', name: 'Dashboard', element: <Dashboard />, private: true },
  { path: '/theme', name: 'Theme', element: <Colors />, exact: true, private: true },
  { path: '/theme/colors', name: 'Colors', element: <Colors />, private: true },
  { path: '/theme/typography', name: 'Typography', element: <Typography />, private: true },
  { path: '/base', name: 'Base', element: <Cards />, exact: true, private: true },
  { path: '/base/accordion', name: 'Accordion', element: <Accordion />, private: true },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: <Breadcrumbs />, private: true },
  { path: '/base/cards', name: 'Cards', element: <Cards />, private: true },
  { path: '/base/carousels', name: 'Carousel', element: <Carousels />, private: true },
  { path: '/base/collapses', name: 'Collapse', element: <Collapses />, private: true },
  { path: '/base/list-groups', name: 'List Groups', element: <ListGroups />, private: true },
  { path: '/base/navs', name: 'Navs', element: <Navs />, private: true },
  { path: '/base/paginations', name: 'Paginations', element: <Paginations />, private: true },
  { path: '/base/placeholders', name: 'Placeholders', element: <Placeholders />, private: true },
  { path: '/base/popovers', name: 'Popovers', element: <Popovers />, private: true },
  { path: '/base/progress', name: 'Progress', element: <Progress />, private: true },
  { path: '/base/spinners', name: 'Spinners', element: <Spinners />, private: true },
  { path: '/base/tabs', name: 'Tabs', element: <Tabs />, private: true },
  { path: '/base/tables', name: 'Tables', element: <Tables />, private: true },
  { path: '/base/tooltips', name: 'Tooltips', element: <Tooltips />, private: true },
  { path: '/buttons', name: 'Buttons', element: <Buttons />, exact: true, private: true },
  { path: '/buttons/buttons', name: 'Buttons', element: <Buttons />, private: true },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: <Dropdowns />, private: true },
  {
    path: '/buttons/button-groups',
    name: 'Button Groups',
    element: <ButtonGroups />,
    private: true,
  },
  { path: '/charts', name: 'Charts', element: <Charts />, private: true },
  { path: '/forms', name: 'Forms', element: <FormControl />, exact: true, private: true },
  { path: '/forms/form-control', name: 'Form Control', element: <FormControl />, private: true },
  { path: '/forms/select', name: 'Select', element: <Select />, private: true },
  {
    path: '/forms/checks-radios',
    name: 'Checks & Radios',
    element: <ChecksRadios />,
    private: true,
  },
  { path: '/forms/range', name: 'Range', element: <Range />, private: true },
  { path: '/forms/input-group', name: 'Input Group', element: <InputGroup />, private: true },
  {
    path: '/forms/floating-labels',
    name: 'Floating Labels',
    element: <FloatingLabels />,
    private: true,
  },
  { path: '/forms/layout', name: 'Layout', element: <Layout />, private: true },
  { path: '/forms/validation', name: 'Validation', element: <Validation />, private: true },
  { path: '/icons', exact: true, name: 'Icons', element: <CoreUIIcons />, private: true },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: <CoreUIIcons />, private: true },
  { path: '/icons/flags', name: 'Flags', element: <Flags />, private: true },
  { path: '/icons/brands', name: 'Brands', element: <Brands />, private: true },
  {
    path: '/notifications',
    name: 'Notifications',
    element: <Alerts />,
    exact: true,
    private: true,
  },
  { path: '/notifications/alerts', name: 'Alerts', element: <Alerts />, private: true },
  { path: '/notifications/badges', name: 'Badges', element: <Badges />, private: true },
  { path: '/notifications/modals', name: 'Modals', element: <Modals />, private: true },
  { path: '/notifications/toasts', name: 'Toasts', element: <Toasts />, private: true },
  { path: '/widgets', name: 'Widgets', element: <Widgets />, private: true },
]

export default routes
