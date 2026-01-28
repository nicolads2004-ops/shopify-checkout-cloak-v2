# 🚀 GUIDE ULTRA SIMPLE - Shopify Checkout Cloak

## ⚡ Installation en 3 étapes

### 1️⃣ Installer
```bash
setup.bat
```

### 2️⃣ Lancer
```bash
npm run dev
```

### 3️⃣ Ouvrir
http://localhost:3000/dashboard

---

## 📋 Configuration Rapide

### Étape 1 : Créer ta boutique source (Shop A)

1. Va sur le **Dashboard**
2. Clique **"Créer la boutique source"**
3. Entre :
   - Nom : `Ma Boutique Principale`
   - Domaine : `ma-boutique.myshopify.com`
4. **COPIE L'API KEY** qui s'affiche

### Étape 2 : Ajouter tes boutiques cibles (B, C, D...)

Pour chaque boutique qui va recevoir les paiements :

1. Clique **"+ Ajouter une boutique cible"**
2. Entre :
   - Nom : `Boutique B`
   - Domaine : `boutique-b.myshopify.com`
   - Access Token : (voir ci-dessous)
   - Poids : `1`

#### 🔑 Obtenir un Access Token

1. Va dans **Admin Shopify** de la boutique cible
2. **Settings** > **Apps and sales channels**
3. **Develop apps** > **Create app**
4. Donne un nom : `Cloak Checkout`
5. **Configuration** > **Storefront API**
6. Active ces permissions :
   - ✅ `unauthenticated_write_checkouts`
   - ✅ `unauthenticated_read_checkouts`
   - ✅ `unauthenticated_read_product_listings`
7. **Save** > **Install app**
8. **Copie le Storefront API access token**

### Étape 3 : Installer le script sur Shop A

1. Va dans **Admin Shopify** de ta boutique source (Shop A)
2. **Online Store** > **Themes** > **Actions** > **Edit code**
3. Ouvre le fichier **`theme.liquid`**
4. Cherche la balise **`</body>`** (tout en bas)
5. **JUSTE AVANT** `</body>`, colle ce code :

```html
<script>
  window.CLOAK_CONFIG = {
    apiUrl: 'http://localhost:3000/api',
    shopId: 'TON_API_KEY_ICI'
  };
</script>
<script src="http://localhost:3000/cloak-script.js"></script>
```

6. Remplace `TON_API_KEY_ICI` par l'API Key de l'étape 1
7. **Save**

---

## ✅ C'est prêt !

Maintenant quand un client clique sur **"Checkout"** sur ta boutique A, il sera automatiquement redirigé vers une boutique B, C ou D de façon rotative !

---

## 📊 Dashboard

Le dashboard te montre :

- **Total redirections** : Combien de fois des clients ont été redirigés
- **Réussies** : Redirections qui ont fonctionné
- **Échouées** : Redirections en erreur
- **Conversions** : Clients qui ont finalisé l'achat
- **Chiffre d'affaires** : Total des ventes

---

## 🔧 Modes de rotation

**Round-Robin** (recommandé)
- Distribution équitable
- B → C → D → B → C → D...

**Pondéré**
- Basé sur le poids
- Si B a poids 2 et C a poids 1, B reçoit 2x plus

**Manuel**
- Toujours la première boutique active

---

## ❓ Problèmes courants

### Le script ne marche pas

1. Vérifie que le script est bien dans `theme.liquid`
2. Vérifie que l'API Key est correcte
3. Ouvre la console du navigateur (F12) pour voir les erreurs

### "Aucune boutique cible disponible"

1. Vérifie qu'au moins une boutique cible est **ACTIVE**
2. Va dans Dashboard > Boutiques cibles > Clique sur **ACTIVER**

### Les produits ne correspondent pas

⚠️ **IMPORTANT** : Les produits doivent exister dans TOUTES les boutiques (A, B, C, D...) avec les **mêmes IDs**.

**Solution** :
1. Exporte les produits de Shop A (CSV)
2. Importe-les dans Shop B, C, D...

---

## 🎯 En production

Quand tu déploies sur un vrai serveur :

1. Change l'URL dans le script :
```javascript
apiUrl: 'https://ton-domaine.com/api'
```

2. Change l'URL du script :
```html
<script src="https://ton-domaine.com/cloak-script.js"></script>
```

---

## 💡 Astuce

Pour tester sans clients réels :
1. Ajoute des produits au panier sur Shop A
2. Clique sur "Checkout"
3. Tu seras redirigé vers Shop B, C ou D
4. Vérifie dans le Dashboard que la redirection est comptée

---

**Besoin d'aide ?** Consulte `README-CLOAK.md` pour plus de détails !
