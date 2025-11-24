#!/bin/bash

# Script di migrazione al controller refactorizzato
# Uso: ./migrate-to-refactored.sh [backup|migrate|rollback|test]

set -e

BACKEND_DIR="backend"
CONTROLLER_DIR="$BACKEND_DIR/controllers"
OLD_CONTROLLER="$CONTROLLER_DIR/projectController.js"
NEW_CONTROLLER="$CONTROLLER_DIR/projectController.refactored.js"
BACKUP_CONTROLLER="$CONTROLLER_DIR/projectController.backup.js"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Funzione per creare backup
create_backup() {
    print_info "Creazione backup del controller originale..."
    
    if [ ! -f "$OLD_CONTROLLER" ]; then
        print_error "Controller originale non trovato: $OLD_CONTROLLER"
        exit 1
    fi
    
    cp "$OLD_CONTROLLER" "$BACKUP_CONTROLLER"
    print_info "Backup creato: $BACKUP_CONTROLLER"
    
    # Crea anche un backup con timestamp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    TIMESTAMPED_BACKUP="$CONTROLLER_DIR/projectController.backup.$TIMESTAMP.js"
    cp "$OLD_CONTROLLER" "$TIMESTAMPED_BACKUP"
    print_info "Backup con timestamp creato: $TIMESTAMPED_BACKUP"
}

# Funzione per migrare al nuovo controller
migrate() {
    print_info "Inizio migrazione al controller refactorizzato..."
    
    # Verifica che il nuovo controller esista
    if [ ! -f "$NEW_CONTROLLER" ]; then
        print_error "Controller refactorizzato non trovato: $NEW_CONTROLLER"
        exit 1
    fi
    
    # Crea backup se non esiste
    if [ ! -f "$BACKUP_CONTROLLER" ]; then
        create_backup
    else
        print_warning "Backup già esistente, salto la creazione"
    fi
    
    # Sostituisci il controller
    print_info "Sostituzione del controller..."
    cp "$NEW_CONTROLLER" "$OLD_CONTROLLER"
    
    print_info "✅ Migrazione completata con successo!"
    print_warning "Ricorda di riavviare il server: npm restart"
}

# Funzione per rollback
rollback() {
    print_info "Inizio rollback al controller originale..."
    
    if [ ! -f "$BACKUP_CONTROLLER" ]; then
        print_error "Backup non trovato: $BACKUP_CONTROLLER"
        print_error "Impossibile effettuare il rollback"
        exit 1
    fi
    
    # Ripristina il backup
    print_info "Ripristino del controller originale..."
    cp "$BACKUP_CONTROLLER" "$OLD_CONTROLLER"
    
    print_info "✅ Rollback completato con successo!"
    print_warning "Ricorda di riavviare il server: npm restart"
}

# Funzione per eseguire i test
run_tests() {
    print_info "Esecuzione test..."
    
    cd "$BACKEND_DIR"
    
    # Verifica che Jest sia installato
    if ! command -v jest &> /dev/null; then
        print_warning "Jest non trovato, installazione in corso..."
        npm install --save-dev jest
    fi
    
    # Esegui i test
    print_info "Esecuzione test unitari..."
    npm test
    
    print_info "✅ Test completati!"
}

# Funzione per verificare la struttura
check_structure() {
    print_info "Verifica struttura moduli..."
    
    REQUIRED_FILES=(
        "$BACKEND_DIR/utils/imageHelpers.js"
        "$BACKEND_DIR/utils/apartmentHelpers.js"
        "$BACKEND_DIR/utils/projectHelpers.js"
        "$BACKEND_DIR/services/projectService.js"
        "$BACKEND_DIR/services/apartmentService.js"
        "$BACKEND_DIR/services/multipartParser.js"
        "$NEW_CONTROLLER"
    )
    
    MISSING_FILES=()
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            MISSING_FILES+=("$file")
        fi
    done
    
    if [ ${#MISSING_FILES[@]} -eq 0 ]; then
        print_info "✅ Tutti i file necessari sono presenti"
        return 0
    else
        print_error "❌ File mancanti:"
        for file in "${MISSING_FILES[@]}"; do
            print_error "  - $file"
        done
        return 1
    fi
}

# Funzione per mostrare lo stato
show_status() {
    print_info "=== Stato Migrazione ==="
    
    if [ -f "$BACKUP_CONTROLLER" ]; then
        print_info "✅ Backup esistente: $BACKUP_CONTROLLER"
    else
        print_warning "⚠️  Nessun backup trovato"
    fi
    
    if [ -f "$NEW_CONTROLLER" ]; then
        print_info "✅ Controller refactorizzato disponibile"
    else
        print_error "❌ Controller refactorizzato non trovato"
    fi
    
    check_structure
    
    # Conta le righe dei controller
    if [ -f "$OLD_CONTROLLER" ]; then
        OLD_LINES=$(wc -l < "$OLD_CONTROLLER")
        print_info "Controller attuale: $OLD_LINES righe"
    fi
    
    if [ -f "$NEW_CONTROLLER" ]; then
        NEW_LINES=$(wc -l < "$NEW_CONTROLLER")
        print_info "Controller refactorizzato: $NEW_LINES righe"
        
        if [ -f "$OLD_CONTROLLER" ]; then
            REDUCTION=$((100 - (NEW_LINES * 100 / OLD_LINES)))
            print_info "Riduzione: ${REDUCTION}%"
        fi
    fi
}

# Menu principale
case "$1" in
    backup)
        create_backup
        ;;
    migrate)
        check_structure || exit 1
        migrate
        ;;
    rollback)
        rollback
        ;;
    test)
        run_tests
        ;;
    status)
        show_status
        ;;
    *)
        echo "Uso: $0 {backup|migrate|rollback|test|status}"
        echo ""
        echo "Comandi:"
        echo "  backup   - Crea un backup del controller attuale"
        echo "  migrate  - Migra al controller refactorizzato"
        echo "  rollback - Ripristina il controller originale"
        echo "  test     - Esegue i test"
        echo "  status   - Mostra lo stato della migrazione"
        exit 1
        ;;
esac

exit 0
