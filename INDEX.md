# 📚 Photobooth Documentation Index

Panduan lengkap untuk semua dokumentasi project Photobooth.

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Clone & setup
git clone <repo-url>
cd photobooth

# 2. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 3. Start development
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev

# 4. Open browser
# http://localhost:5173
```

👉 **Full guide**: [QUICKSTART.md](./QUICKSTART.md)

---

## 📖 Documentation Overview

### 📋 Core Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **README.md** | Project overview & features | 5 min |
| **QUICKSTART.md** | Installation & setup guide | 10 min |
| **ARCHITECTURE.md** | System design & data flow | 15 min |
| **DESIGN.md** | UI/UX & neomorph styling | 20 min |
| **DSLR_SETUP.md** | Camera connection guide | 15 min |
| **API.md** | REST API endpoints | 20 min |
| **DEVELOPMENT.md** | Development workflow | 15 min |
| **PROJECT_STRUCTURE.md** | Directory layout | 10 min |

**Total Reading Time**: ~110 minutes (~2 hours)

---

## 🎯 Reading Guide by Role

### 👤 For Project Managers

1. ✅ [README.md](./README.md) - Project overview
2. ✅ [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
3. ✅ [DEVELOPMENT.md](./DEVELOPMENT.md) - Development checklist

### 👨‍💻 For Frontend Developers

1. ✅ [QUICKSTART.md](./QUICKSTART.md) - Setup
2. ✅ [DESIGN.md](./DESIGN.md) - UI Guidelines
3. ✅ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Folder structure
4. ✅ [API.md](./API.md) - Backend endpoints
5. ✅ [DEVELOPMENT.md](./DEVELOPMENT.md) - Testing & debugging

### 🔧 For Backend Developers

1. ✅ [QUICKSTART.md](./QUICKSTART.md) - Setup
2. ✅ [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
3. ✅ [DSLR_SETUP.md](./DSLR_SETUP.md) - Camera integration
4. ✅ [API.md](./API.md) - API design
5. ✅ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Backend structure
6. ✅ [DEVELOPMENT.md](./DEVELOPMENT.md) - Testing & debugging

### 📷 For Camera/Hardware Setup

1. ✅ [DSLR_SETUP.md](./DSLR_SETUP.md) - Camera connection
2. ✅ [ARCHITECTURE.md](./ARCHITECTURE.md) - System overview

### 🎨 For UI/UX Designers

1. ✅ [DESIGN.md](./DESIGN.md) - Design system
2. ✅ [README.md](./README.md) - Feature overview
3. ✅ [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Components

---

## 🗺️ Documentation Map

```
START HERE
    ↓
README.md (Overview)
    ↓
    ├─→ QUICKSTART.md (Setup)
    │       ├─→ DEVELOPMENT.md (Dev workflow)
    │       └─→ DSLR_SETUP.md (Camera)
    │
    ├─→ ARCHITECTURE.md (System design)
    │       ├─→ PROJECT_STRUCTURE.md (Folders)
    │       └─→ API.md (Endpoints)
    │
    └─→ DESIGN.md (UI/UX)
            └─→ Neomorph styling
```

---

## 📚 Document Details

### 📋 README.md
**Purpose**: Project overview, features, tech stack

**Contains**:
- Project description
- Feature list
- Architecture diagram
- Quick start instructions
- Tech stack overview
- User flow documentation

**Best for**: Getting oriented, understanding scope

---

### 🚀 QUICKSTART.md
**Purpose**: Get up and running in 5 minutes

**Contains**:
- Prerequisites checklist
- Step-by-step installation
- Environment setup
- Testing connection
- Troubleshooting common issues

**Best for**: First-time setup, new team members

---

### 🏗️ ARCHITECTURE.md
**Purpose**: Deep dive into system design

**Contains**:
- System architecture diagram
- Data flow diagrams
- Module breakdown
- API communication layer
- Data models
- Performance considerations
- Security architecture

**Best for**: Understanding how things work, planning features

---

### 🎨 DESIGN.md
**Purpose**: Complete design system documentation

**Contains**:
- Color palette (neomorph white + red)
- Typography system
- Component designs
- Button states
- Shadow system
- Responsive design
- Accessibility guidelines
- Animation specifications

**Best for**: Building UI components, maintaining consistency

---

### 📷 DSLR_SETUP.md
**Purpose**: Camera connection & configuration

**Contains**:
- Supported cameras list
- Installation by OS
- gphoto2 setup
- Node.js/Python integration
- Configuration file
- Troubleshooting
- Testing procedures

**Best for**: Setting up camera, debugging connection issues

---

### 🔌 API.md
**Purpose**: Complete REST API documentation

**Contains**:
- Response format
- All endpoints
- Request/response examples
- Status codes
- Error handling
- cURL examples
- Postman integration

**Best for**: Frontend/backend integration, API testing

---

### 👨‍💻 DEVELOPMENT.md
**Purpose**: Development workflow & best practices

**Contains**:
- Development checklist
- Git workflow
- Testing guidelines
- Debugging techniques
- Performance optimization
- Security checklist
- Code style guide
- Deployment checklist

**Best for**: Day-to-day development, quality assurance

---

### 📁 PROJECT_STRUCTURE.md
**Purpose**: Complete directory structure

**Contains**:
- Full folder tree
- File descriptions
- Size guidelines
- .gitignore template
- Naming conventions
- Quick navigation

**Best for**: Finding files, understanding organization

---

## 🔍 Finding What You Need

### "How do I...?"

| Question | Answer |
|----------|--------|
| Get started? | [QUICKSTART.md](./QUICKSTART.md) |
| Setup camera? | [DSLR_SETUP.md](./DSLR_SETUP.md) |
| Build a component? | [DESIGN.md](./DESIGN.md) |
| Call an API? | [API.md](./API.md) |
| Understand the code? | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Find a file? | [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) |
| Run tests? | [DEVELOPMENT.md](./DEVELOPMENT.md) |
| Debug an issue? | [DEVELOPMENT.md](./DEVELOPMENT.md) |
| Deploy to prod? | [DEVELOPMENT.md](./DEVELOPMENT.md) |

### "How does...?"

| Question | Answer |
|----------|--------|
| Photo capture work? | [ARCHITECTURE.md](./ARCHITECTURE.md) → Data Flow |
| Layout generation work? | [API.md](./API.md) → `/api/layout/generate` |
| Neomorph styling work? | [DESIGN.md](./DESIGN.md) → Shadow System |
| Camera integration work? | [DSLR_SETUP.md](./DSLR_SETUP.md) |
| State management work? | [ARCHITECTURE.md](./ARCHITECTURE.md) → State Management Flow |

---

## 📊 Documentation Stats

```
Total Documents: 9
Total Lines: ~5,700
Total Size: ~135 KB

Breakdown:
- README.md                 361 lines    12 KB
- QUICKSTART.md            669 lines    12 KB
- ARCHITECTURE.md          823 lines    26 KB
- DESIGN.md                795 lines    17 KB
- DSLR_SETUP.md            723 lines    16 KB
- API.md                 1,063 lines    17 KB
- DEVELOPMENT.md           717 lines    15 KB
- PROJECT_STRUCTURE.md     562 lines    20 KB
- INDEX.md (this file)     ~400 lines   ~8 KB
```

---

## 🎯 Learning Paths

### Path 1: Full Project Understanding (2 hours)
1. README.md (5 min)
2. ARCHITECTURE.md (15 min)
3. PROJECT_STRUCTURE.md (10 min)
4. DESIGN.md (20 min)
5. API.md (20 min)
6. DSLR_SETUP.md (15 min)
7. DEVELOPMENT.md (15 min)

### Path 2: Frontend Developer (1.5 hours)
1. QUICKSTART.md (10 min)
2. DESIGN.md (20 min)
3. PROJECT_STRUCTURE.md (10 min)
4. API.md (20 min)
5. DEVELOPMENT.md (15 min)
6. Browse React components (10 min)

### Path 3: Backend Developer (1.5 hours)
1. QUICKSTART.md (10 min)
2. ARCHITECTURE.md (15 min)
3. API.md (20 min)
4. DSLR_SETUP.md (15 min)
5. DEVELOPMENT.md (15 min)
6. Browse service files (10 min)

### Path 4: Camera Setup Only (30 minutes)
1. DSLR_SETUP.md (15 min)
2. QUICKSTART.md - Camera section (10 min)
3. Test connection (5 min)

---

## 🔗 Cross-References

### Common Topics

**Camera Integration**
- Primary: [DSLR_SETUP.md](./DSLR_SETUP.md)
- Secondary: [ARCHITECTURE.md](./ARCHITECTURE.md) → Modules
- Also see: [API.md](./API.md) → Camera Endpoints

**Photo Processing**
- Primary: [ARCHITECTURE.md](./ARCHITECTURE.md) → Image Pipeline
- Secondary: [DEVELOPMENT.md](./DEVELOPMENT.md) → Performance Optimization

**UI Components**
- Primary: [DESIGN.md](./DESIGN.md)
- Secondary: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) → Components

**API Development**
- Primary: [API.md](./API.md)
- Secondary: [ARCHITECTURE.md](./ARCHITECTURE.md) → API Communication

**Testing**
- Primary: [DEVELOPMENT.md](./DEVELOPMENT.md) → Testing
- Secondary: [ARCHITECTURE.md](./ARCHITECTURE.md) → Testing Architecture

---

## 💡 Tips

1. **Keep open while coding**: Use CMD+click (Mac) or Ctrl+click (Windows) to open links
2. **Search documents**: Use CTRL+F to search within each MD file
3. **GitHub friendly**: All docs are viewable directly on GitHub
4. **Printable**: Can print to PDF for offline reference
5. **Update together**: Keep docs in sync with code changes

---

## 🆘 Need Help?

### If stuck on...

**Setup Issues**
1. Check [QUICKSTART.md](./QUICKSTART.md) → Troubleshooting
2. Check [DSLR_SETUP.md](./DSLR_SETUP.md) → Troubleshooting

**Build/Test Issues**
1. Check [DEVELOPMENT.md](./DEVELOPMENT.md) → Debugging
2. Check [DEVELOPMENT.md](./DEVELOPMENT.md) → Troubleshooting

**API Integration**
1. Check [API.md](./API.md) → Examples
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) → Data Flow

**Design/Styling**
1. Check [DESIGN.md](./DESIGN.md) → Components
2. Check [DESIGN.md](./DESIGN.md) → Best Practices

**System Design**
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) → Module Architecture
2. Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) → File Dependencies

---

## 📝 Documentation Maintenance

### Update Frequency
- README.md: When adding features
- QUICKSTART.md: When setup process changes
- ARCHITECTURE.md: When system design changes
- DESIGN.md: When design system changes
- DSLR_SETUP.md: When camera support changes
- API.md: When adding/modifying endpoints
- DEVELOPMENT.md: When workflow changes
- PROJECT_STRUCTURE.md: When file structure changes

### How to Contribute
1. Make changes to docs
2. Update version date: "Last Updated: September 2026"
3. Update [CHANGELOG.md](./CHANGELOG.md)
4. Submit PR with doc updates

---

## 🎓 Knowledge Levels

### Beginner
Start with:
- README.md
- QUICKSTART.md
- DESIGN.md

### Intermediate
Add:
- ARCHITECTURE.md
- API.md
- PROJECT_STRUCTURE.md

### Advanced
Add:
- DEVELOPMENT.md
- Full code deep dive
- Security & optimization

---

## 📋 Checklist Before Starting

- [ ] Read README.md
- [ ] Run QUICKSTART.md
- [ ] Setup camera (DSLR_SETUP.md)
- [ ] Understand architecture (ARCHITECTURE.md)
- [ ] Review design system (DESIGN.md)
- [ ] Check API endpoints (API.md)
- [ ] Familiarize with structure (PROJECT_STRUCTURE.md)
- [ ] Read development guide (DEVELOPMENT.md)
- [ ] Setup IDE & tools
- [ ] Join team communication channels

---

**Last Updated**: September 2026  
**Documentation v1.0**

---

### Quick Links

- [GitHub Repository](#)
- [Issue Tracker](#)
- [Discussions](#)
- [Email Support](#)

**Happy coding!** 🚀📸
