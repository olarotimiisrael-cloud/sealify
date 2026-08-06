"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSealify } from '../context/SealifyContext';
import AdminEditUserModal from '../components/AdminEditUserModal';
import AdminSettingsModal from '../components/AdminSettingsModal';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';
import FilterDrawer from '../components/FilterDrawer';
import CompareModal from '../components/CompareModal';
import SavedAlertsModal from '../components/SavedAlertsModal';
import AiShoppingAssistantModal from '../components/AiShoppingAssistantModal';
import SqlSchemaViewer from '../components/SqlSchemaViewer';
import VerifiedBadge from '../components/VerifiedBadge';
import DatabaseTest from '../components/DatabaseTest';
import DatabaseSchemaGenerator from '../components/DatabaseSchemaGenerator';
import DatabaseDiagramViewer from '../components/DatabaseDiagramViewer';
import MigrationExecutor from '../components/MigrationExecutor';
import { 
  X, CheckCircle2, Plus, 
  Shield, 
  Users, 
  Package, 
  Check, 
  Edit3, 
  AlertOctagon, 
  Info, 
  Lock, 
  KeyRound, 
  Radio, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  Siren, 
  Mail, 
  Download, 
  Square, 
  Send, 
  Filter, 
  BarChart3, 
  ShieldAlert, 
  Gavel, 
  Sparkles, 
  Terminal,
  Activity,
  Megaphone,
  Trash2,
  Crown,
  Clock,
  ExternalLink,
  RefreshCw,
  Award,
  CheckSquare,
  Database,
  Settings,
  KeyRound as KeyRoundIcon,
  GitBranch,
  Play,
  StopCircle,
  AlertTriangle,
  Server,
  HardDrive,
  Zap
} from 'lucide-react';
import { UserProfile, Listing, UserStatus } from '../types/sealify';
import { toast } from 'sonner';

// ... rest of the file remains the same