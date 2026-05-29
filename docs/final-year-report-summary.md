# Final Year Project Report Summary

## Osusu: Digitising Rotating Savings Groups for The Gambia

---

## Abstract

Osusu is a full-stack web application that digitises traditional rotating savings and credit associations (ROSCAs), commonly known as *osusu* in The Gambia, West Africa. The platform replaces paper-based record-keeping with a transparent, mobile-friendly digital system where group organisers create savings circles, members join via invite codes, and contributions are tracked through an automated payout schedule. Built with React 19, Express 5, and Supabase (PostgreSQL), the application demonstrates the practical application of modern web technologies to solve a real-world financial inclusion problem. The system implements atomic database operations for race-condition-free financial tracking, role-based access control, and a state-machine-driven workflow that enforces the strict lifecycle of rotating savings groups.

---

## Problem Statement

Traditional osusu groups in The Gambia operate through paper ledgers and verbal agreements. This approach presents several critical problems:

1. **Disputes over contributions** — Without a central, tamper-proof record, disagreements arise about who has paid and when
2. **Lost records** — Paper ledgers can be damaged, lost, or destroyed
3. **No audit trail** — There is no way to verify historical payments
4. **Trust dependency** — Groups rely entirely on the organiser's honesty and record-keeping ability
5. **Scaling limitations** — Managing multiple groups or large groups is impractical with paper
6. **No transparency** — Members cannot independently verify their contribution history or payout schedule

These issues limit the effectiveness and reach of osusu groups as a savings mechanism, particularly as communities become more mobile and digitally connected.

---

## Objectives

1. **Digitise the osusu lifecycle** — Create a digital platform that faithfully models the complete lifecycle of a rotating savings group: formation, member joining, activation, contribution tracking, payout disbursement, and completion.

2. **Ensure financial data integrity** — Implement atomic database operations to prevent race conditions on financial counters, ensuring accuracy even under concurrent access.

3. **Provide role-based access control** — Distinguish clearly between organiser and member permissions, with organiser-only access to sensitive operations.

4. **Deliver a mobile-first experience** — Build a responsive, mobile-friendly interface suitable for users who primarily access the internet through smartphones.

5. **Maintain security best practices** — Implement authentication, authorisation, input validation, rate limiting, and secure token management.

6. **Document the system comprehensively** — Produce professional-grade documentation suitable for both academic review and portfolio presentation.

---

## Methodology

### Technology Selection

| Requirement | Selected Technology | Justification |
|---|---|---|
| Frontend framework | React 19 | Component-based architecture, large ecosystem, strong community support |
| Build tool | Vite 8 | Fast development server with hot module replacement, optimised production builds |
| Styling | Tailwind CSS 3 | Utility-first CSS, rapid prototyping, small production bundle with purging |
| Backend framework | Express 5 | Minimalist, well-tested, extensive middleware ecosystem |
| Runtime | Node.js 20 | JavaScript full-stack consistency, excellent I/O performance |
| Database | Supabase (PostgreSQL) | Managed PostgreSQL with built-in auth, real-time capabilities, generous free tier |
| Authentication | Supabase Auth | JWT-based, built-in password management, session handling |
| HTTP client | Axios | Interceptor-based architecture for clean auth token management |

### Development Process

The project was built using an iterative, phased approach following a detailed build specification:

1. **Phase 1 — Foundation:** Project setup, database schema, authentication (backend + frontend), layout components, routing
2. **Phase 2 — Groups:** Group CRUD, join with invite code, dashboard, create group wizard, group detail page
3. **Phase 3 — Schedule:** Payout schedule generator, group activation, schedule display
4. **Phase 4 — Contributions:** Contribution recording with atomic counters, cycle completion, progress tracking
5. **Phase 5 — Polish:** Profile management, mobile responsiveness, loading/error/empty states, deployment

### Architecture

The system follows a three-tier architecture:

- **Presentation Layer:** React single-page application with client-side routing
- **Application Layer:** Express 5 REST API with middleware pipeline (security, auth, authorisation)
- **Data Layer:** PostgreSQL via Supabase with atomic RPC functions and database triggers

---

## System Design Highlights

### Database Schema

Five tables model the domain: `profiles` (user data linked to auth), `groups` (savings circles with lifecycle state), `group_members` (many-to-many with payout order), `cycles` (individual payout periods), and `contributions` (member payments). PostgreSQL enums enforce valid states, triggers auto-create profiles on signup, and unique constraints prevent duplicate contributions.

### Atomic Financial Operations

Financial integrity is ensured through PostgreSQL functions that atomically update `total_collected` counters:

```sql
-- Single-statement atomic increment prevents race conditions
UPDATE cycles SET total_collected = total_collected + amount WHERE id = cycle_id;
```

This eliminates the read-modify-write race condition that would occur with client-side logic.

### Fair Payout Randomisation

When a group activates, the Fisher-Yates shuffle algorithm produces an unbiased random permutation of members, ensuring every member has an equal chance of receiving the payout in any position.

### Compensating Transactions

Group activation is a multi-step operation (shuffle members → generate cycles → insert cycles → update status). If any step fails after a mutation, earlier changes are rolled back through compensating actions, maintaining data consistency without a full transaction manager.

### State Machine Workflow

Groups follow a strict lifecycle enforced at the application level: `FORMING → ACTIVE → COMPLETED` (or `CANCELLED`). Cycles follow: `PENDING → COLLECTING → PAID_OUT`. These state machines prevent invalid transitions and make the system behaviour predictable.

---

## Results

### Functional Achievements

| Feature | Status | Description |
|---|---|---|
| User registration/login | ✅ Complete | Email/password auth with Gambian phone validation |
| Password recovery | ✅ Complete | Forgot password + reset password flows |
| Group creation | ✅ Complete | Multi-step wizard with invite code generation |
| Group joining | ✅ Complete | Invite-code-based with validation |
| Group activation | ✅ Complete | Fisher-Yates shuffle, automatic schedule generation |
| Contribution recording | ✅ Complete | Atomic counter updates, duplicate prevention |
| Cycle management | ✅ Complete | Automatic advancement, group completion detection |
| Profile management | ✅ Complete | Name, phone, password updates |
| Dashboard | ✅ Complete | Summary cards, group list, archived groups |
| Mobile responsiveness | ✅ Complete | All pages functional at 375px+ widths |

### Technical Metrics

| Metric | Value |
|---|---|
| Total lines of code (backend) | ~1,688 |
| Total lines of code (frontend) | ~2,500 |
| Database tables | 5 |
| PostgreSQL enums | 4 |
| Database triggers | 3 |
| Atomic RPC functions | 2 |
| Database indexes | 6 |
| API endpoints | 21 |
| Frontend pages | 11 |
| Reusable components | 14 |
| Security middleware | 4 |
| External dependencies (server) | 7 |
| External dependencies (client) | 5 |

---

## Challenges Solved

### 1. Race Conditions on Financial Counters

**Challenge:** When an organiser records contributions for multiple members simultaneously, the `total_collected` counter could lose updates due to the read-modify-write pattern.

**Solution:** PostgreSQL RPC functions perform single-statement atomic updates: `UPDATE cycles SET total_collected = total_collected + amount`. This eliminates the race condition entirely.

### 2. Data Consistency Without a Transaction Manager

**Challenge:** Group activation requires multiple database writes. If any write fails, the database could be left in an inconsistent state.

**Solution:** A compensating transaction pattern was implemented — if later steps fail, earlier changes are manually reverted (stored payout orders restored, inserted cycles deleted).

### 3. Secure Token Synchronisation

**Challenge:** The frontend needs to use Supabase tokens obtained through the custom Express backend, not through the direct Supabase client.

**Solution:** After login/register, tokens are explicitly synced into the Supabase SDK via `supabase.auth.setSession()`, and the Axios interceptor reads from `supabase.auth.getSession()` on every request.

### 4. Email Enumeration Prevention

**Challenge:** The forgot-password endpoint must not reveal whether an email exists in the system.

**Solution:** The endpoint always returns the same success message regardless of whether the email exists, and all errors are silently logged server-side.

### 5. Fair Payout Order

**Challenge:** The payout order must be unpredictable and fair to all members.

**Solution:** The Fisher-Yates (Knuth) shuffle algorithm produces an unbiased random permutation where every ordering is equally likely.

---

## Technologies Used

### Frontend
- **React 19** — UI component library
- **Vite 8** — Build tool and development server
- **Tailwind CSS 3** — Utility-first CSS framework
- **React Router 7** — Client-side routing
- **Axios 1** — HTTP client with interceptors
- **react-hot-toast 2** — Toast notifications

### Backend
- **Node.js 20** — JavaScript runtime
- **Express 5** — Web application framework
- **Supabase JS 2** — Database and auth client
- **helmet** — Security headers middleware
- **cors** — Cross-Origin Resource Sharing middleware
- **morgan** — HTTP request logging
- **express-rate-limit** — Rate limiting middleware

### Database
- **PostgreSQL** — Relational database
- **Supabase** — Managed PostgreSQL with auth

### Development Tools
- **ESLint** — JavaScript linting
- **Nodemon** — Development server auto-restart
- **Git** — Version control

---

## Conclusion

Osusu successfully demonstrates that modern web technologies can effectively digitise traditional financial practices in a developing-world context. The platform provides a transparent, secure, and mobile-friendly alternative to paper-based osusu group management, addressing real needs in Gambian communities.

The project achieves all its primary objectives: digitising the complete osusu lifecycle, ensuring financial data integrity through atomic operations, implementing role-based access control, delivering a mobile-first user experience, and maintaining security best practices throughout.

### Key Strengths

- **Financial integrity:** Atomic database operations eliminate the most common class of bugs in financial applications — race conditions on counters
- **Practical security:** Application-level authorisation combined with service-role database access provides a pragmatic security model appropriate for an MVP
- **State machine workflow:** Enforced lifecycle transitions prevent inconsistent states and make system behaviour predictable
- **Comprehensive documentation:** Both the codebase and the supporting documentation meet professional software engineering standards

### Areas for Future Development

- Automated testing suite (the most significant gap in current implementation)
- Mobile money payment integration for end-to-end digital financial services
- Real-time notifications for payment reminders and cycle updates
- Admin dashboard for platform oversight
- Native mobile application for improved mobile user experience

The Osusu platform stands as a complete, production-ready MVP that successfully bridges traditional community savings practices with modern software engineering, demonstrating that thoughtful technology application can enhance, rather than replace, important cultural institutions.

---

## References

1. Ardener, S. (1964). The Comparative Study of Rotating Credit Associations. *Journal of the Royal Anthropological Institute*, 94(2), 201-229.
2. Bouman, F. J. A. (1995). ROSCAs: On the Origin of the Species. *Savings and Development*, 19(2), 117-148.
3. Besley, T., Coate, S., & Loury, G. (1993). The Economics of Rotating Savings and Credit Associations. *The American Economic Review*, 83(4), 792-810.
4. Supabase Documentation. (2025). *Supabase JavaScript Client Reference*. https://supabase.com/docs/reference/javascript/
5. React Documentation. (2025). *React 19 Release Notes*. https://react.dev/blog/2025/04/25/react-19
6. Express.js Documentation. (2025). *Express 5.x API Reference*. https://expressjs.com/en/5x/api.html
7. Vite Documentation. (2025). *Vite Configuration Reference*. https://vitejs.dev/config/
8. OWASP Foundation. (2025). *OWASP Top Ten Web Application Security Risks*. https://owasp.org/www-project-top-ten/
9. Tailwind CSS Documentation. (2025). *Tailwind CSS v3 Documentation*. https://tailwindcss.com/docs/
10. Fisher, R. A., & Yates, F. (1938). *Statistical Tables for Biological, Agricultural and Medical Research*. Oliver & Boyd.
