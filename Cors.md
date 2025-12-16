# Configuration CORS

## Domaines Autorisés

Le serveur est configuré pour n'accepter que les requêtes provenant des domaines suivants :

- `hevitro.com`
- `*.hevitro.com` (tous les sous-domaines)
- `teratany.org`
- `*.teratany.org` (tous les sous-domaines)

## Exemples de domaines autorisés

✅ **Autorisés :**
- `https://hevitro.com`
- `https://www.hevitro.com`
- `https://app.hevitro.com`
- `https://api.hevitro.com`
- `https://teratany.org`
- `https://www.teratany.org`
- `https://files.teratany.org`

❌ **Non autorisés :**
- `https://autre-domaine.com`
- `https://hevitro.fr`
- `https://fake-hevitro.com`

## Modification des Domaines Autorisés

Pour ajouter ou modifier les domaines autorisés, éditer le fichier `server.js` :

```javascript
const allowedDomains = [
  'hevitro.com',
  'teratany.org',
  // Ajouter d'autres domaines ici
  'nouveau-domaine.com'
];
```

## Requêtes Sans Origin

Les requêtes sans header `Origin` (comme celles de Postman, curl, ou des scripts serveur) sont automatiquement autorisées pour faciliter le développement et les tests.

## Tester les CORS

### Depuis un navigateur (domaine autorisé)

```javascript
fetch('http://localhost:3001/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include' // Important pour les cookies
})
```

### Depuis curl (aucune restriction)

```bash
curl -X POST http://localhost:3001/upload \
  -F "file=@image.jpg"
```

## Erreurs CORS

Si vous recevez une erreur CORS :

1. Vérifiez que votre domaine est dans la liste `allowedDomains`
2. Vérifiez que vous utilisez le bon protocole (http/https)
3. Vérifiez les logs du serveur pour voir l'origin rejeté

Message d'erreur typique :
```
Error: Not allowed by CORS
```

## Production

En production, assurez-vous que :
1. Tous vos domaines de production sont dans `allowedDomains`
2. Les sous-domaines sont inclus si nécessaire
3. Le serveur utilise HTTPS
4. Les certificats SSL sont valides