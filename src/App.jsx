import { useState } from 'react'
import { Home, Syringe, ShowerHead, User, PawPrint, Bell, LogOut } from 'lucide-react'
import FoodBowlIcon from './icons/FoodBowlIcon'
import Dashboard from './components/Dashboard'
import PetProfileScreen from './components/PetProfileScreen'
import PerfilSection from './components/PerfilSection'
import RacaoSection from './components/RacaoSection'
import VacinasSection from './components/VacinasSection'
import BanhosSection from './components/BanhosSection'
import AuthScreen from './components/AuthScreen'
import CompletarCasaScreen from './components/CompletarCasaScreen'
import { usePets } from './hooks/usePets'
import { useSupplies } from './hooks/useSupplies'
import { useHealthRecords } from './hooks/useHealthRecords'
import { useBaths } from './hooks/useBaths'
import { useAuth } from './hooks/useAuth'
import { usePushNotifications } from './hooks/usePushNotifications'

const THEME_NAV_ITEMS = [
  { id: 'casa', label: 'Início', Icon: Home },
  { id: 'racao', label: 'Ração & Higiene', Icon: FoodBowlIcon },
  { id: 'vacinas', label: 'Vacinas & Saúde', Icon: Syringe },
  { id: 'banhos', label: 'Banhos', Icon: ShowerHead },
  { id: 'perfil', label: 'Perfil', Icon: User },
]

const SECTION_TITLES = {
  racao: 'Alimentação & Higiene',
  vacinas: 'Saúde',
  banhos: 'Saúde',
  perfil: 'Perfil',
}

function App() {
  const { session, perfil, loading, signIn, signUp, signOut, entrarNaCasa } = useAuth()
  const [activeSection, setActiveSection] = useState('casa')
  const [activePet, setActivePet] = useState('casa')
  const casaId = perfil?.casa_id
  const { pets, addPet, updatePet } = usePets(casaId)
  const { supplies, addSupply, markSupplyEnded, updateSupply, deleteSupply } = useSupplies(casaId)
  const { records: healthRecords, addRecord: addHealthRecord } = useHealthRecords(casaId)
  const { baths, addBath, updateBathGroup } = useBaths()
  const { permission, requestPermission } = usePushNotifications(session?.user?.id)

  if (loading) {
    return <div className="app" />
  }

  if (!session) {
    return <AuthScreen signIn={signIn} signUp={signUp} />
  }

  if (!perfil) {
    return <CompletarCasaScreen session={session} entrarNaCasa={entrarNaCasa} />
  }

  const petSwitcherItems = [
    { id: 'casa', label: 'Casa', kind: 'icon', Icon: Home },
    ...pets.map((pet) => ({ id: pet.id, label: pet.name, kind: 'pet', pet })),
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <span className="avatar-photo" aria-hidden="true">
            <PawPrint size={22} strokeWidth={2.4} />
          </span>
          <div>
            <p className="greeting">Bem-vinda de volta <span aria-hidden="true">👋</span></p>
            <h1 className="brand">Meu Pet</h1>
          </div>
          <div className="header-actions">
            <button
              className="icon-btn"
              aria-label="Notificações"
              onClick={requestPermission}
              title={
                permission === 'granted'
                  ? 'Notificações ativadas'
                  : permission === 'denied'
                    ? 'Notificações bloqueadas no navegador'
                    : 'Ativar notificações'
              }
            >
              <Bell size={18} strokeWidth={2.25} fill={permission === 'granted' ? 'currentColor' : 'none'} />
            </button>
            <button className="icon-btn" aria-label="Sair" onClick={signOut}>
              <LogOut size={18} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </header>

      {activeSection === 'casa' && activePet === 'casa' && (
        <div className="promo-banner">
          <div>
            <h2>
              Cuidados em dia, <span className="accent">sempre</span>
            </h2>
            <p>Ração, vacinas e banhos dos seus pets num só lugar.</p>
          </div>
        </div>
      )}

      {activeSection === 'casa' && (
        <div className="pet-switcher" role="tablist" aria-label="Selecionar pet">
          {petSwitcherItems.map((item) => {
            const isActive = activePet === item.id
            const initial = item.kind === 'pet' ? (item.pet.name || '?').charAt(0).toUpperCase() : null
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                className={`pet-chip ${isActive ? 'active' : ''}`}
                onClick={() => setActivePet(item.id)}
              >
                <span
                  className={`pet-chip-icon ${item.kind === 'pet' ? `tone-${item.pet.tone}` : ''}`}
                >
                  {item.kind === 'icon' ? (
                    <item.Icon size={20} strokeWidth={2} />
                  ) : item.pet.photo ? (
                    <img src={item.pet.photo} alt="" className="pet-chip-photo" />
                  ) : (
                    initial
                  )}
                </span>
                <span className="pet-chip-label">{item.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {SECTION_TITLES[activeSection] && (
        <h2 className="screen-title">{SECTION_TITLES[activeSection]}</h2>
      )}

      {activeSection === 'casa' && activePet === 'casa' && (
        <Dashboard
          pets={pets}
          supplies={supplies}
          healthRecords={healthRecords}
          baths={baths}
          onAlertClick={setActiveSection}
          onSelectPet={setActivePet}
        />
      )}
      {activeSection === 'casa' && activePet !== 'casa' && (
        <PetProfileScreen
          pet={pets.find((pet) => pet.id === activePet)}
          healthRecords={healthRecords}
          baths={baths}
          onBack={() => setActivePet('casa')}
        />
      )}
      {activeSection === 'perfil' && (
        <PerfilSection
          pets={pets}
          onSave={updatePet}
          onAddPet={addPet}
          session={session}
          perfil={perfil}
        />
      )}
      {activeSection === 'racao' && (
        <RacaoSection
          supplies={supplies}
          onAddSupply={addSupply}
          onMarkEnded={markSupplyEnded}
          onUpdateSupply={updateSupply}
          onDeleteSupply={deleteSupply}
        />
      )}
      {activeSection === 'vacinas' && (
        <VacinasSection pets={pets} records={healthRecords} onAddRecord={addHealthRecord} />
      )}
      {activeSection === 'banhos' && (
        <BanhosSection pets={pets} baths={baths} onAddBath={addBath} onUpdateBath={updateBathGroup} />
      )}

      <nav className="bottom-nav" aria-label="Navegação principal">
        {THEME_NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className="nav-icon">
                <item.Icon size={20} strokeWidth={2} />
              </span>
              <span className="sr-only">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default App
