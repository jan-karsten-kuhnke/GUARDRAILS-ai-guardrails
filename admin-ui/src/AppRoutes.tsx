import { RiskDashboard } from './components/Dashboards/Risk/riskDashboard';
import { UsageDashboard } from './components/Dashboards/Usage/usageDashboard';
import { ChatGrid } from './components/DataGrids/ChatGrid';
import { AnalyseGrid } from './components/DataGrids/AnalyseGrid';
import { AnonymizeGrid } from './components/DataGrids/AnonymizeGrid';
import { ComingSoon } from './components/ComingSoon/ComingSoon';
import {PredefinedRulesGrid} from './components/PII Entities/PredifnedRulesGrid';
import { ConversationGrid } from './components/DataGrids/ConversationGrid';
import { Escalation } from './components/Escalations/Escalation';
import { PrivateDocuments } from './components/PrivateDocuments/PrivateDocuments';

export const AppRoutes = [

    {
        path: '/',
        component:< RiskDashboard/>
    },
    {
        path: '/risk-monitoring',
        component:< RiskDashboard/>
    },
    {
        path: '/usage-monitoring',
        component:< ComingSoon/>
    },
    {
        path: '/conversation-logs',
        component:< ConversationGrid/>
    },
    {
        path: '/chat-logs',
        component:< ChatGrid/>
    },
    {
        path: '/analysis-logs',
        component:< AnalyseGrid/>
    },
    {
        path: '/redaction-logs',
        component:< AnonymizeGrid/>
    },
    {
        path: '/pre-defined-rules',
        component:< PredefinedRulesGrid/>
    },
    {
        path: '/custom-deny-lists',
        component:< ComingSoon/>
    },
    {
        path: '/detection-models',
        component:< ComingSoon/>
    },
    {
        path: '/user-management',
        component:< ComingSoon/>
    },
    {
        path:'escalations',
        component:<Escalation/>
    },
    {
        path:'/private-documents',
        component:<PrivateDocuments/>
    }
];

