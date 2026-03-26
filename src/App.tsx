import { Route, Switch, Redirect } from 'wouter';

// Pages
import { Login } from './pages/Login';

// Participant
import { ParticipantDashboard } from './pages/participant/Dashboard';
import { ModuleLibrary } from './pages/participant/ModuleLibrary';
import { ModuleOverview } from './pages/participant/ModuleOverview';
import { LessonDetail } from './pages/participant/LessonDetail';
import { QuizFlow } from './pages/participant/QuizFlow';
import { ParticipantProgress } from './pages/participant/Progress';

// Admin
import { AdminDashboard } from './pages/admin/Dashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { ParticipantDetail } from './pages/admin/ParticipantDetail';
import { QuestionBank } from './pages/admin/QuestionBank';
import { ContentManagement } from './pages/admin/ContentManagement';

export default function App() {
  return (
    <Switch>
      {/* Root */}
      <Route path="/" component={Login} />

      {/* Participant */}
      <Route path="/participant/dashboard" component={ParticipantDashboard} />
      <Route path="/participant/modules" component={ModuleLibrary} />
      <Route path="/participant/modules/:id/lesson/:lessonId" component={LessonDetail} />
      <Route path="/participant/modules/:id/quiz" component={QuizFlow} />
      <Route path="/participant/modules/:id" component={ModuleOverview} />
      <Route path="/participant/progress" component={ParticipantProgress} />

      {/* Admin */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users/:id" component={ParticipantDetail} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/questions" component={QuestionBank} />
      <Route path="/admin/content" component={ContentManagement} />

      {/* Fallback */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}
