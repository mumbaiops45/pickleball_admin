/**
 * Icon set, backed by lucide-react.
 *
 * Thin named adapters rather than direct imports, so call sites stay stable
 * and every icon inherits the same stroke weight. Sizing comes from Tailwind
 * classes (`size-4`) — the CSS wins over the width/height lucide renders.
 */
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  ChevronRight,
  CircleUser,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileChartColumn,
  Filter,
  Image as ImageSquare,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Trash2,
  TriangleAlert,
  Upload,
  Users,
  X,
} from "lucide-react";

const STROKE = 1.75;

const adapt = (Component, overrides = {}) =>
  function Icon({ strokeWidth = STROKE, ...props }) {
    return <Component strokeWidth={strokeWidth} {...overrides} {...props} />;
  };

export const DashboardIcon = adapt(LayoutDashboard);
export const ProductsIcon = adapt(Package);
export const CategoriesIcon = adapt(Tag);
export const OrdersIcon = adapt(ShoppingCart);
export const CustomersIcon = adapt(Users);
export const PaymentsIcon = adapt(CreditCard);
export const SettingsIcon = adapt(Settings);
export const InventoryIcon = adapt(Boxes);
export const ReportsIcon = adapt(FileChartColumn);
export const RupeeIcon = adapt(BadgeIndianRupee);

export const MenuIcon = adapt(Menu);
export const CloseIcon = adapt(X);
export const SearchIcon = adapt(Search);
export const FilterIcon = adapt(Filter);
export const BellIcon = adapt(Bell);
export const ChevronDownIcon = adapt(ChevronDown);
export const ChevronRightIcon = adapt(ChevronRight);
export const ArrowLeftIcon = adapt(ArrowLeft);
export const ArrowRightIcon = adapt(ArrowRight);
export const ExternalLinkIcon = adapt(ExternalLink);

export const UserIcon = adapt(CircleUser);
export const LogOutIcon = adapt(LogOut);
export const LockIcon = adapt(Lock);
export const MailIcon = adapt(Mail);
export const ShieldIcon = adapt(ShieldCheck);
export const EyeIcon = adapt(Eye);
export const EyeOffIcon = adapt(EyeOff);
export const HelpIcon = adapt(LifeBuoy);

export const ImageIcon = adapt(ImageSquare);
export const LinkIcon = adapt(Link2);
export const UploadIcon = adapt(Upload);
export const DownloadIcon = adapt(Download);

export const PlusIcon = adapt(Plus);
export const EditIcon = adapt(Pencil);
export const TrashIcon = adapt(Trash2);
export const RefreshIcon = adapt(RefreshCw);
export const CheckIcon = adapt(Check);
export const WarnIcon = adapt(TriangleAlert);
export const SpinnerIcon = adapt(Loader2);
